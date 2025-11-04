/* eslint-disable @typescript-eslint/no-var-requires */
const ROLE_ARRAY = "ARRAY['super_admin','administrator','manager','operator','viewer']::text[]";

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS safety_incidents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      incident_type text NOT NULL,
      severity text NOT NULL DEFAULT 'minor',
      description text NOT NULL,
      location text,
      job_id uuid REFERENCES jobs ON DELETE SET NULL,
      reported_by uuid REFERENCES auth.users,
      involved_employees jsonb NOT NULL DEFAULT '[]'::jsonb,
      witnesses jsonb NOT NULL DEFAULT '[]'::jsonb,
      injury_occurred boolean NOT NULL DEFAULT false,
      medical_attention boolean NOT NULL DEFAULT false,
      property_damage boolean NOT NULL DEFAULT false,
      root_cause text,
      corrective_actions text,
      status text NOT NULL DEFAULT 'open',
      incident_date date NOT NULL DEFAULT current_date,
      reported_at timestamptz NOT NULL DEFAULT now(),
      attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS safety_incidents_job_idx ON safety_incidents(job_id);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS safety_training (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
      training_name text NOT NULL,
      training_type text NOT NULL,
      completion_date date NOT NULL,
      expiration_date date,
      certificate_url text,
      instructor text,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS compliance_rules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code text NOT NULL,
      name text NOT NULL,
      severity text NOT NULL DEFAULT 'minor',
      category text NOT NULL DEFAULT 'general',
      point_penalty integer NOT NULL DEFAULT 5,
      description text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS compliance_rules_code_idx ON compliance_rules(code);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS employee_violations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
      rule_id uuid NOT NULL REFERENCES compliance_rules ON DELETE CASCADE,
      violation_date date NOT NULL DEFAULT current_date,
      description text,
      points_deducted integer NOT NULL DEFAULT 0,
      reported_by uuid REFERENCES auth.users,
      attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS employee_violations_lookup ON employee_violations(employee_id, violation_date);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS disciplinary_actions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
      violation_id uuid REFERENCES employee_violations ON DELETE SET NULL,
      action_type text NOT NULL,
      description text,
      effective_date date NOT NULL DEFAULT current_date,
      duration_days integer,
      auto_generated boolean NOT NULL DEFAULT true,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS employee_compliance_scores (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
      score numeric(6,2) NOT NULL DEFAULT 100,
      period_start date NOT NULL,
      period_end date NOT NULL,
      trend jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT employee_compliance_scores_unique UNIQUE (employee_id, period_start, period_end)
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      type text NOT NULL DEFAULT 'job',
      job_id uuid REFERENCES jobs ON DELETE SET NULL,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS chat_rooms_job_idx ON chat_rooms(job_id);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id uuid NOT NULL REFERENCES chat_rooms ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users,
      message text NOT NULL,
      attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS chat_messages_room_idx ON chat_messages(room_id, created_at);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS game_profiles (
      user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      points integer NOT NULL DEFAULT 0,
      xp integer NOT NULL DEFAULT 0,
      level integer NOT NULL DEFAULT 1,
      streak_current integer NOT NULL DEFAULT 0,
      streak_longest integer NOT NULL DEFAULT 0,
      last_event_date date,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS game_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
      event_type text NOT NULL,
      idempotency_key text NOT NULL,
      device_id text,
      lat double precision,
      lng double precision,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS game_events_idempotent_idx ON game_events(idempotency_key);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS game_badges (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
      badge_code text NOT NULL,
      title text NOT NULL,
      description text,
      earned_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT game_badges_unique UNIQUE (user_id, badge_code)
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS game_quests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      quest_code text NOT NULL,
      name text NOT NULL,
      description text,
      rewards jsonb NOT NULL DEFAULT '{}'::jsonb,
      requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS game_quests_code_idx ON game_quests(quest_code);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS game_quest_progress (
      user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
      quest_code text NOT NULL,
      progress_key text NOT NULL,
      progress_value numeric(12,2) NOT NULL DEFAULT 0,
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, quest_code, progress_key)
    );
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION app_public.upsert_quest_progress(
      p_user_id uuid,
      p_code text,
      p_key text,
      p_inc numeric
    )
    RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
    BEGIN
      INSERT INTO game_quest_progress (user_id, quest_code, progress_key, progress_value)
      VALUES (p_user_id, p_code, p_key, COALESCE(p_inc,0))
      ON CONFLICT (user_id, quest_code, progress_key)
      DO UPDATE SET progress_value = game_quest_progress.progress_value + COALESCE(p_inc,0),
                    updated_at = now();
    END;
    $$;
    GRANT EXECUTE ON FUNCTION app_public.upsert_quest_progress(uuid, text, text, numeric) TO authenticated, service_role;
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS dark_zones (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      active boolean NOT NULL DEFAULT true,
      coordinates jsonb NOT NULL DEFAULT '[]'::jsonb,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER dark_zones_touch_updated BEFORE UPDATE ON dark_zones
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE OR REPLACE VIEW "DarkZones" AS
      SELECT id, name, active, coordinates, metadata, created_by, created_at, updated_at
      FROM dark_zones;
  `);

  pgm.sql(`
    INSERT INTO compliance_rules (code, name, severity, category, point_penalty, description) VALUES
      ('PPE-001','Missing PPE','major','Safety',10,'Required personal protective equipment was not worn on site.'),
      ('SCHED-001','Missed Check-in','moderate','Operations',5,'Crew failed to log required job check-in.'),
      ('QUAL-001','Workmanship Issue','major','Quality',15,'Quality standards not met during execution.'),
      ('SAF-INC-001','Safety Incident','critical','Safety',25,'Reportable safety incident occurred.'),
      ('DOC-001','Documentation Missing','minor','Compliance',3,'Required documentation not submitted.')
    ON CONFLICT (code) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO game_quests (quest_code, name, description, rewards, requirements) VALUES
      ('PHOTO_PRO','Photo Documentation Specialist','Upload five photo updates in a single week.','{"points":50}'::jsonb,'{"type":"count","target":5}'::jsonb),
      ('STREAK_KEEPER','Streak Keeper','Maintain a 7-day activity streak.','{"points":75}'::jsonb,'{"type":"streak","days":7}'::jsonb)
    ON CONFLICT (quest_code) DO NOTHING;
  `);

  const rlsTables = [
    "safety_incidents",
    "safety_training",
    "compliance_rules",
    "employee_violations",
    "disciplinary_actions",
    "employee_compliance_scores",
    "chat_rooms",
    "chat_messages",
    "game_profiles",
    "game_events",
    "game_badges",
    "game_quests",
    "game_quest_progress",
    "dark_zones",
  ];

  rlsTables.forEach((table) => {
    pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(
      `CREATE POLICY ${table}_select_authenticated ON ${table} FOR SELECT USING (app_public.is_authenticated());`,
    );
  });

  const ownerTables = [
    "safety_incidents",
    "safety_training",
    "employee_violations",
    "disciplinary_actions",
    "chat_rooms",
    "chat_messages",
    "dark_zones",
  ];

  ownerTables.forEach((table) => {
    pgm.sql(`
      CREATE POLICY ${table}_write_manage ON ${table}
        FOR ALL
        USING (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()))
        WITH CHECK (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()));
    `);
  });

  pgm.sql(`
    CREATE POLICY chat_messages_sender_policy ON chat_messages
      FOR ALL USING (user_id = auth.uid() OR app_public.user_has_any_role(${ROLE_ARRAY}))
      WITH CHECK (user_id = auth.uid() OR app_public.user_has_any_role(${ROLE_ARRAY}));
  `);

  pgm.sql(`
    CREATE POLICY game_profiles_self ON game_profiles
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  `);

  pgm.sql(`
    CREATE POLICY game_events_admin_manage ON game_events
      FOR ALL USING (app_public.user_has_any_role(ARRAY['super_admin','administrator']))
      WITH CHECK (app_public.user_has_any_role(ARRAY['super_admin','administrator']));
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP VIEW IF EXISTS "DarkZones";`);

  const tables = [
    "game_quest_progress",
    "game_quests",
    "game_badges",
    "game_events",
    "game_profiles",
    "chat_messages",
    "chat_rooms",
    "employee_compliance_scores",
    "disciplinary_actions",
    "employee_violations",
    "compliance_rules",
    "safety_training",
    "safety_incidents",
    "dark_zones",
  ];

  tables.forEach((table) => pgm.dropTable(table, { ifExists: true, cascade: true }));

  pgm.sql(`DROP FUNCTION IF EXISTS app_public.upsert_quest_progress(uuid, text, text, numeric);`);
};
