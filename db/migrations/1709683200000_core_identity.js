/* eslint-disable @typescript-eslint/no-var-requires */
const ROLE_ARRAY = "ARRAY['super_admin','administrator','manager','operator','viewer']::text[]";

exports.up = (pgm) => {
  ["pgcrypto", "uuid-ossp", "citext", "cube", "earthdistance"].forEach((ext) =>
    pgm.createExtension(ext, { ifNotExists: true }),
  );

  pgm.sql(`CREATE SCHEMA IF NOT EXISTS app_public;`);
  pgm.sql(`CREATE SCHEMA IF NOT EXISTS app_private;`);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION app_public.is_authenticated()
    RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT auth.uid() IS NOT NULL; $$;
    GRANT EXECUTE ON FUNCTION app_public.is_authenticated() TO anon, authenticated, service_role;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION app_public.user_has_role(target_role text)
    RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
      SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
          AND (r.id = target_role OR r.name = target_role)
      );
    $$;
    GRANT EXECUTE ON FUNCTION app_public.user_has_role(text) TO anon, authenticated, service_role;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION app_public.user_has_any_role(target_roles text[])
    RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
      SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
          AND (r.id = ANY(target_roles) OR r.name = ANY(target_roles))
      );
    $$;
    GRANT EXECUTE ON FUNCTION app_public.user_has_any_role(text[]) TO anon, authenticated, service_role;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION app_private.touch_updated_at()
    RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION app_private.set_profile_defaults()
    RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.id IS NULL THEN NEW.id := COALESCE(NEW.user_id, gen_random_uuid()); END IF;
      IF NEW.user_id IS NULL THEN NEW.user_id := NEW.id; END IF;
      IF NEW.created_at IS NULL THEN NEW.created_at := now(); END IF;
      NEW.updated_at := now();
      RETURN NEW;
    END;
    $$;
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS roles (
      id text PRIMARY KEY,
      name text UNIQUE NOT NULL,
      description text,
      priority integer NOT NULL DEFAULT 0,
      is_system boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER roles_touch_updated BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    INSERT INTO roles (id, name, description, priority) VALUES
      ('super_admin','Super Administrator','Full platform access including configuration.',100),
      ('administrator','Administrator','Manage teams, jobs, and billing.',80),
      ('manager','Manager','Coordinate projects and crews.',60),
      ('operator','Operator','Execute field work and updates.',40),
      ('viewer','Viewer','Read-only stakeholder access.',20)
    ON CONFLICT (id) DO NOTHING;
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS profiles (
      id uuid PRIMARY KEY,
      user_id uuid UNIQUE REFERENCES auth.users ON DELETE CASCADE,
      email citext,
      full_name text,
      phone text,
      title text,
      company text,
      avatar_url text,
      timezone text NOT NULL DEFAULT 'America/New_York',
      preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
      onboarding_status text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER profiles_defaults BEFORE INSERT OR UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION app_private.set_profile_defaults();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
      role_id text NOT NULL REFERENCES roles ON DELETE CASCADE,
      assigned_by uuid REFERENCES auth.users,
      assigned_at timestamptz NOT NULL DEFAULT now(),
      notes text,
      CONSTRAINT user_roles_unique_assignment UNIQUE (user_id, role_id)
    );
    CREATE INDEX IF NOT EXISTS user_roles_role_idx ON user_roles(role_id);
  `);

  pgm.sql(
    `CREATE TYPE IF NOT EXISTS job_status AS ENUM ('draft','scheduled','in_progress','completed','on_hold','cancelled');`,
  );

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS clients (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text,
      name text NOT NULL,
      contact_name text,
      email citext,
      phone text,
      address text,
      city text,
      state text,
      postal_code text,
      country text DEFAULT 'USA',
      latitude numeric(10,6),
      longitude numeric(10,6),
      notes text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      church_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
      owner_id uuid REFERENCES auth.users,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS clients_slug_unique ON clients(slug) WHERE slug IS NOT NULL;
    CREATE INDEX IF NOT EXISTS clients_name_idx ON clients(name);
    CREATE TRIGGER clients_touch_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS jobs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid REFERENCES clients ON DELETE SET NULL,
      title text NOT NULL,
      description text,
      status job_status NOT NULL DEFAULT 'draft',
      priority text DEFAULT 'normal',
      scheduled_start timestamptz,
      scheduled_end timestamptz,
      actual_start timestamptz,
      actual_end timestamptz,
      latitude numeric(10,6),
      longitude numeric(10,6),
      progress numeric(5,2) NOT NULL DEFAULT 0,
      estimated_cost numeric(12,2),
      actual_cost numeric(12,2),
      scope jsonb NOT NULL DEFAULT '{}'::jsonb,
      owner_id uuid REFERENCES auth.users,
      created_by uuid REFERENCES auth.users,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS jobs_client_idx ON jobs(client_id);
    CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status);
    CREATE TRIGGER jobs_touch_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS employees (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users ON DELETE SET NULL,
      first_name text NOT NULL,
      last_name text NOT NULL,
      email citext,
      phone text,
      role text,
      status text NOT NULL DEFAULT 'active',
      hire_date date,
      hourly_rate numeric(10,2),
      compensation_type text NOT NULL DEFAULT 'hourly',
      certifications jsonb NOT NULL DEFAULT '[]'::jsonb,
      emergency_contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS employees_name_idx ON employees(last_name, first_name);
    CREATE TRIGGER employees_touch_updated BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  // Row level security for base tables
  ["roles", "profiles", "user_roles", "clients", "jobs", "employees"].forEach((table) => {
    pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(
      `CREATE POLICY ${table}_select_authenticated ON ${table} FOR SELECT USING (app_public.is_authenticated());`,
    );
  });

  pgm.sql(`
    CREATE POLICY roles_manage ON roles
      FOR ALL USING (app_public.user_has_role('super_admin'))
      WITH CHECK (app_public.user_has_role('super_admin'));
  `);

  pgm.sql(`
    CREATE POLICY profiles_self_manage ON profiles
      FOR ALL USING (id = auth.uid() OR app_public.user_has_role('super_admin'))
      WITH CHECK (id = auth.uid() OR app_public.user_has_role('super_admin'));
  `);

  pgm.sql(`
    CREATE POLICY user_roles_admin_manage ON user_roles
      FOR ALL USING (app_public.user_has_any_role(ARRAY['super_admin','administrator']))
      WITH CHECK (app_public.user_has_any_role(ARRAY['super_admin','administrator']));
  `);

  pgm.sql(`
    CREATE POLICY clients_write_manage ON clients
      FOR ALL USING (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()))
      WITH CHECK (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()));
  `);

  pgm.sql(`
    CREATE POLICY jobs_write_manage ON jobs
      FOR ALL USING (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()))
      WITH CHECK (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()));
  `);

  pgm.sql(`
    CREATE POLICY employees_write_manage ON employees
      FOR ALL USING (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()))
      WITH CHECK (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()));
  `);
};

exports.down = (pgm) => {
  ["employees", "jobs", "clients", "user_roles", "profiles", "roles"].forEach((table) =>
    pgm.dropTable(table, { ifExists: true, cascade: true }),
  );
  pgm.dropType("job_status", { ifExists: true });

  [
    "app_private.set_profile_defaults",
    "app_private.touch_updated_at",
    "app_public.user_has_any_role",
    "app_public.user_has_role",
    "app_public.is_authenticated",
  ].forEach((fn) => pgm.sql(`DROP FUNCTION IF EXISTS ${fn} CASCADE;`));

  pgm.sql(`DROP SCHEMA IF EXISTS app_private CASCADE;`);
  pgm.sql(`DROP SCHEMA IF EXISTS app_public CASCADE;`);

  ["earthdistance", "cube", "citext", "uuid-ossp", "pgcrypto"].forEach((ext) =>
    pgm.dropExtension(ext, { ifExists: true }),
  );
};
