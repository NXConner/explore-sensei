/* eslint-disable @typescript-eslint/no-var-requires */

const COMMAND_ROLES = "ARRAY['super_admin','administrator','manager']::text[]";
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS hud_preferences (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid UNIQUE REFERENCES auth.users ON DELETE CASCADE,
      theme_id text NOT NULL DEFAULT 'tactical-dark',
      fidelity_mode text NOT NULL DEFAULT 'inspired',
      wallpaper jsonb NOT NULL DEFAULT '{}'::jsonb,
      wallpaper_opacity integer NOT NULL DEFAULT 65,
      feature_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
      layout jsonb NOT NULL DEFAULT '{}'::jsonb,
      sound_enabled boolean NOT NULL DEFAULT false,
      glitch_intensity integer NOT NULL DEFAULT 30,
      animation_speed integer NOT NULL DEFAULT 100,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER hud_preferences_touch_updated
      BEFORE UPDATE ON hud_preferences
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS mission_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type text NOT NULL,
      title text NOT NULL,
      description text,
      severity text NOT NULL DEFAULT 'info',
      status text NOT NULL DEFAULT 'open',
      source text DEFAULT 'operations',
      occurred_at timestamptz NOT NULL DEFAULT now(),
      acknowledged_at timestamptz,
      acknowledged_by uuid REFERENCES auth.users,
      related_job uuid REFERENCES jobs ON DELETE SET NULL,
      related_client uuid REFERENCES clients ON DELETE SET NULL,
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS mission_events_severity_idx ON mission_events(severity, status);
    CREATE INDEX IF NOT EXISTS mission_events_occurred_idx ON mission_events(occurred_at DESC);
    CREATE TRIGGER mission_events_touch_updated
      BEFORE UPDATE ON mission_events
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS map_layers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      layer_type text NOT NULL,
      description text,
      is_enabled_default boolean NOT NULL DEFAULT true,
      ordering integer NOT NULL DEFAULT 0,
      config jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER map_layers_touch_updated
      BEFORE UPDATE ON map_layers
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE UNIQUE INDEX IF NOT EXISTS inventory_items_sku_unique_idx
      ON inventory_items(sku)
      WHERE sku IS NOT NULL;
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS telemetry_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id text,
      user_id uuid REFERENCES auth.users ON DELETE SET NULL,
      category text NOT NULL,
      action text NOT NULL,
      label text,
      value numeric(12,4),
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS telemetry_events_lookup ON telemetry_events(category, created_at DESC);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS mission_alert_subscriptions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
      subscription_type text NOT NULL,
      channels text[] NOT NULL DEFAULT ARRAY['in-app'],
      preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT mission_alert_subscriptions_unique UNIQUE (user_id, subscription_type)
    );
    CREATE TRIGGER mission_alert_subscriptions_touch_updated
      BEFORE UPDATE ON mission_alert_subscriptions
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  // RLS setup
  const userTables = ["hud_preferences", "mission_alert_subscriptions"];
  userTables.forEach((table) => {
    pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(`CREATE POLICY ${table}_owner_policy ON ${table}
      FOR ALL USING (user_id = auth.uid() OR app_public.user_has_any_role(${COMMAND_ROLES}))
      WITH CHECK (user_id = auth.uid() OR app_public.user_has_any_role(${COMMAND_ROLES}));`);
  });

  const commandTables = ["mission_events", "map_layers"];
  commandTables.forEach((table) => {
    pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(`CREATE POLICY ${table}_select_authenticated ON ${table}
      FOR SELECT USING (app_public.is_authenticated());`);
    pgm.sql(`CREATE POLICY ${table}_command_write ON ${table}
      FOR ALL USING (app_public.user_has_any_role(${COMMAND_ROLES}))
      WITH CHECK (app_public.user_has_any_role(${COMMAND_ROLES}));`);
  });

  pgm.sql(`ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`CREATE POLICY telemetry_events_select_authenticated ON telemetry_events
    FOR SELECT USING (app_public.is_authenticated());`);
  pgm.sql(`CREATE POLICY telemetry_events_insert_authenticated ON telemetry_events
    FOR INSERT WITH CHECK (app_public.is_authenticated());`);

  // Seed default map layers for first run (idempotent)
  pgm.sql(`
    INSERT INTO map_layers (slug, name, layer_type, description, ordering, config)
    VALUES
      ('pulse-scan', 'Pulse Scan', 'effect', 'Animated Division pulse scan overlay for intel sweeps.', 10, jsonb_build_object('color', '#ff6f0f', 'duration_ms', 4800)),
      ('threat-heatmap', 'Threat Heatmap', 'heatmap', 'Aggregated risk scores across mission zones.', 20, jsonb_build_object('intensity', 0.65)),
      ('weather-radar', 'Weather Radar', 'tile', 'Storm readiness radar with lightning strikes.', 30, jsonb_build_object('provider', 'noaa', 'refresh_seconds', 180)),
      ('crew-location', 'Crew Location', 'realtime', 'Live employee telemetry plotted on tactical map.', 40, jsonb_build_object('accuracy_threshold', 45)),
      ('mission-objectives', 'Mission Objectives', 'vector', 'Objective markers with status badges.', 50, jsonb_build_object('show_eta', true))
    ON CONFLICT (slug) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  [
    "mission_alert_subscriptions",
    "telemetry_events",
    "map_layers",
    "mission_events",
    "hud_preferences",
  ].forEach((table) => pgm.dropTable(table, { ifExists: true, cascade: true }));

  pgm.sql(`DROP INDEX IF EXISTS inventory_items_sku_unique_idx;`);
};
