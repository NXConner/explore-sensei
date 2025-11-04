/* eslint-disable @typescript-eslint/no-var-requires */
const ROLE_ARRAY = "ARRAY['super_admin','administrator','manager','operator','viewer']::text[]";

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
      job_id uuid REFERENCES jobs ON DELETE SET NULL,
      clock_in timestamptz NOT NULL,
      clock_out timestamptz,
      break_duration integer NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'open',
      notes text,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS time_entries_open_idx ON time_entries(employee_id) WHERE status = 'open';
    CREATE TRIGGER time_entries_touch_updated BEFORE UPDATE ON time_entries
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      type text NOT NULL DEFAULT 'truck',
      status text NOT NULL DEFAULT 'available',
      vin text,
      license_plate text,
      odometer numeric(12,2),
      last_service_date date,
      assigned_to uuid REFERENCES employees ON DELETE SET NULL,
      location jsonb NOT NULL DEFAULT '{}'::jsonb,
      telemetry jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER vehicles_touch_updated BEFORE UPDATE ON vehicles
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS mapmeasurements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      type text NOT NULL,
      value numeric(18,6) NOT NULL,
      unit text NOT NULL,
      geojson jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS mapmeasurements_author_idx ON mapmeasurements(created_by) WHERE created_by IS NOT NULL;
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS employee_locations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
      latitude double precision NOT NULL,
      longitude double precision NOT NULL,
      accuracy double precision,
      speed double precision,
      heading double precision,
      activity_type text,
      battery_level double precision,
      timestamp timestamptz NOT NULL DEFAULT now(),
      raw jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS employee_locations_lookup ON employee_locations(employee_id, timestamp);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS daily_activity_summary (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
      date date NOT NULL,
      total_distance_km numeric(12,3) NOT NULL DEFAULT 0,
      total_time_minutes numeric(10,2) NOT NULL DEFAULT 0,
      first_location_time timestamptz,
      last_location_time timestamptz,
      locations_count integer NOT NULL DEFAULT 0,
      path_geojson jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT daily_activity_summary_unique UNIQUE (employee_id, date)
    );
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION app_public.generate_daily_summary(p_employee_id uuid, p_date date)
    RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
    DECLARE
      r RECORD;
      prev_lat double precision;
      prev_lng double precision;
      first_ts timestamptz;
      last_ts timestamptz;
      total_distance double precision := 0;
      locations integer := 0;
      coords jsonb := '[]'::jsonb;
    BEGIN
      FOR r IN
        SELECT latitude, longitude, timestamp
        FROM employee_locations
        WHERE employee_id = p_employee_id
          AND timestamp::date = p_date
        ORDER BY timestamp
      LOOP
        locations := locations + 1;
        IF first_ts IS NULL THEN first_ts := r.timestamp; END IF;
        last_ts := r.timestamp;
        coords := coords || jsonb_build_array(jsonb_build_array(r.longitude, r.latitude));
        IF prev_lat IS NOT NULL THEN
          total_distance := total_distance + earth_distance(
            ll_to_earth(prev_lat, prev_lng),
            ll_to_earth(r.latitude, r.longitude)
          );
        END IF;
        prev_lat := r.latitude;
        prev_lng := r.longitude;
      END LOOP;

      INSERT INTO daily_activity_summary (
        employee_id, date, total_distance_km, total_time_minutes,
        first_location_time, last_location_time, locations_count, path_geojson, created_at
      )
      VALUES (
        p_employee_id,
        p_date,
        COALESCE(total_distance / 1000, 0),
        COALESCE(EXTRACT(EPOCH FROM (last_ts - first_ts)) / 60, 0),
        first_ts,
        last_ts,
        locations,
        jsonb_build_object('type','LineString','coordinates', coords),
        now()
      )
      ON CONFLICT (employee_id, date)
      DO UPDATE SET
        total_distance_km = EXCLUDED.total_distance_km,
        total_time_minutes = EXCLUDED.total_time_minutes,
        first_location_time = EXCLUDED.first_location_time,
        last_location_time = EXCLUDED.last_location_time,
        locations_count = EXCLUDED.locations_count,
        path_geojson = EXCLUDED.path_geojson,
        created_at = now();
    END;
    $$;
    GRANT EXECUTE ON FUNCTION app_public.generate_daily_summary(uuid, date) TO authenticated, service_role;
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS automation_rules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      trigger_type text NOT NULL,
      trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb,
      action_type text NOT NULL,
      action_config jsonb NOT NULL DEFAULT '{}'::jsonb,
      active boolean NOT NULL DEFAULT true,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER automation_rules_touch_updated BEFORE UPDATE ON automation_rules
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users,
      action text NOT NULL,
      resource_type text NOT NULL,
      resource_id text,
      details jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS activity_logs_resource_idx ON activity_logs(resource_type, resource_id);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users ON DELETE CASCADE,
      title text NOT NULL,
      body text NOT NULL,
      category text NOT NULL DEFAULT 'general',
      severity text NOT NULL DEFAULT 'info',
      action_url text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      read_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, created_at);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS weather_alerts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      type text NOT NULL DEFAULT 'storm',
      severity text NOT NULL DEFAULT 'medium',
      title text,
      message text NOT NULL,
      location jsonb NOT NULL DEFAULT '{}'::jsonb,
      radius numeric(6,2) NOT NULL DEFAULT 10,
      start_time timestamptz NOT NULL DEFAULT now(),
      end_time timestamptz NOT NULL,
      source text DEFAULT 'NOAA',
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS weather_alerts_active_idx ON weather_alerts(end_time) WHERE end_time >= now();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS user_onboarding (
      user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      completed_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
      current_step text,
      is_completed boolean NOT NULL DEFAULT false,
      skipped_at timestamptz,
      completed_at timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS user_shortcuts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
      action text NOT NULL,
      shortcut text NOT NULL,
      is_custom boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT user_shortcuts_unique_action UNIQUE (user_id, action)
    );
    CREATE TRIGGER user_shortcuts_touch_updated BEFORE UPDATE ON user_shortcuts
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS ai_asphalt_detections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      source text NOT NULL DEFAULT 'upload',
      image_width integer,
      image_height integer,
      map_lat double precision,
      map_lng double precision,
      map_zoom double precision,
      roi jsonb NOT NULL DEFAULT '{}'::jsonb,
      condition text,
      confidence_score numeric(5,2),
      area_sqft numeric(12,2),
      area_sqm numeric(12,2),
      priority text,
      estimated_repair_cost numeric(12,2),
      ai_notes text,
      analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`
    CREATE OR REPLACE VIEW user_roles_v_legacy AS
      SELECT ur.user_id,
             r.name AS role,
             r.id AS role_id,
             ur.assigned_at
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id;
  `);

  const rlsTables = [
    "time_entries",
    "vehicles",
    "mapmeasurements",
    "employee_locations",
    "daily_activity_summary",
    "automation_rules",
    "activity_logs",
    "notifications",
    "weather_alerts",
    "user_onboarding",
    "user_shortcuts",
    "ai_asphalt_detections",
  ];

  rlsTables.forEach((table) => {
    pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(
      `CREATE POLICY ${table}_select_authenticated ON ${table} FOR SELECT USING (app_public.is_authenticated());`,
    );
  });

  const ownerTables = [
    "time_entries",
    "vehicles",
    "mapmeasurements",
    "automation_rules",
    "activity_logs",
    "notifications",
    "ai_asphalt_detections",
  ];

  ownerTables.forEach((table) => {
    pgm.sql(`
      CREATE POLICY ${table}_write_manage ON ${table}
        FOR ALL
        USING (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()))
        WITH CHECK (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()));
    `);
  });

  pgm.sql(
    `CREATE POLICY user_shortcuts_owner_policy ON user_shortcuts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`,
  );
  pgm.sql(
    `CREATE POLICY user_onboarding_owner_policy ON user_onboarding FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`,
  );
  pgm.sql(
    `CREATE POLICY notifications_owner_policy ON notifications FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`,
  );
  pgm.sql(`
    CREATE POLICY employee_locations_restrict ON employee_locations
      FOR SELECT USING (
        app_public.user_has_any_role(ARRAY['super_admin','administrator','manager'])
        OR EXISTS (SELECT 1 FROM employees e WHERE e.id = employee_locations.employee_id AND e.user_id = auth.uid())
      );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP VIEW IF EXISTS user_roles_v_legacy;`);

  const tables = [
    "ai_asphalt_detections",
    "user_shortcuts",
    "user_onboarding",
    "weather_alerts",
    "notifications",
    "activity_logs",
    "automation_rules",
    "daily_activity_summary",
    "employee_locations",
    "mapmeasurements",
    "vehicles",
    "time_entries",
  ];

  tables.forEach((table) => pgm.dropTable(table, { ifExists: true, cascade: true }));

  pgm.sql(`DROP FUNCTION IF EXISTS app_public.generate_daily_summary(uuid, date);`);
};
