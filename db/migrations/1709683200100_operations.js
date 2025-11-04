/* eslint-disable @typescript-eslint/no-var-requires */
const ROLE_ARRAY = "ARRAY['super_admin','administrator','manager','operator','viewer']::text[]";

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS asset_assignments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_type text NOT NULL,
      asset_identifier text,
      assigned_to uuid REFERENCES employees ON DELETE SET NULL,
      job_id uuid REFERENCES jobs ON DELETE SET NULL,
      condition_out text,
      condition_in text,
      assigned_at timestamptz NOT NULL DEFAULT now(),
      returned_at timestamptz,
      notes text,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS asset_assignments_active_idx ON asset_assignments(assigned_to) WHERE returned_at IS NULL;
    CREATE TRIGGER asset_assignments_touch_updated BEFORE UPDATE ON asset_assignments
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      sku text,
      name text NOT NULL,
      category text,
      unit text NOT NULL DEFAULT 'unit',
      quantity numeric(12,2) NOT NULL DEFAULT 0,
      reorder_level numeric(12,2) NOT NULL DEFAULT 0,
      unit_cost numeric(12,2) DEFAULT 0,
      location text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS inventory_items_category_idx ON inventory_items(category);
    CREATE TRIGGER inventory_items_touch_updated BEFORE UPDATE ON inventory_items
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      item_id uuid NOT NULL REFERENCES inventory_items ON DELETE CASCADE,
      change_quantity numeric(12,2) NOT NULL,
      reason text NOT NULL,
      job_id uuid REFERENCES jobs,
      performed_by uuid REFERENCES auth.users,
      notes text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS inventory_transactions_item_idx ON inventory_transactions(item_id);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS cost_catalog (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      region text,
      created_by uuid REFERENCES auth.users,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER cost_catalog_touch_updated BEFORE UPDATE ON cost_catalog
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS cost_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      catalog_id uuid NOT NULL REFERENCES cost_catalog ON DELETE CASCADE,
      item_code text,
      name text NOT NULL,
      description text,
      unit text NOT NULL,
      unit_cost numeric(12,2) NOT NULL DEFAULT 0,
      markup_rate numeric(5,2) NOT NULL DEFAULT 0,
      category text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS cost_items_catalog_idx ON cost_items(catalog_id);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS estimates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name text NOT NULL,
      customer_email citext,
      customer_phone text,
      job_site_address text,
      catalog_id uuid REFERENCES cost_catalog ON DELETE SET NULL,
      subtotal numeric(12,2) NOT NULL DEFAULT 0,
      tax_rate numeric(5,2) NOT NULL DEFAULT 0,
      tax_amount numeric(12,2) NOT NULL DEFAULT 0,
      total numeric(12,2) NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'draft',
      notes text,
      valid_until date,
      created_by uuid REFERENCES auth.users,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER estimates_touch_updated BEFORE UPDATE ON estimates
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS estimate_line_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      estimate_id uuid NOT NULL REFERENCES estimates ON DELETE CASCADE,
      cost_item_id uuid REFERENCES cost_items ON DELETE SET NULL,
      item_name text NOT NULL,
      item_code text,
      description text,
      quantity numeric(12,2) NOT NULL DEFAULT 1,
      unit text NOT NULL DEFAULT 'unit',
      unit_cost numeric(12,2) NOT NULL DEFAULT 0,
      line_total numeric(12,2) NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS estimate_line_items_estimate_idx ON estimate_line_items(estimate_id);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS invoices (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid REFERENCES clients ON DELETE SET NULL,
      job_id uuid REFERENCES jobs ON DELETE SET NULL,
      status text NOT NULL DEFAULT 'draft',
      issued_on date NOT NULL DEFAULT current_date,
      due_on date,
      subtotal numeric(12,2) NOT NULL DEFAULT 0,
      tax_amount numeric(12,2) NOT NULL DEFAULT 0,
      total numeric(12,2) NOT NULL DEFAULT 0,
      balance_due numeric(12,2) NOT NULL DEFAULT 0,
      notes text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TRIGGER invoices_touch_updated BEFORE UPDATE ON invoices
      FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id uuid NOT NULL REFERENCES invoices ON DELETE CASCADE,
      description text NOT NULL,
      quantity numeric(12,2) NOT NULL DEFAULT 1,
      unit_price numeric(12,2) NOT NULL DEFAULT 0,
      line_total numeric(12,2) NOT NULL DEFAULT 0
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS job_photos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id uuid NOT NULL REFERENCES jobs ON DELETE CASCADE,
      employee_id uuid REFERENCES employees ON DELETE SET NULL,
      file_path text NOT NULL,
      file_name text NOT NULL,
      url text NOT NULL,
      description text,
      photo_type text NOT NULL DEFAULT 'progress',
      latitude numeric(10,6),
      longitude numeric(10,6),
      taken_at timestamptz DEFAULT now(),
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS job_photos_job_idx ON job_photos(job_id);
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS daily_field_reports (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id uuid REFERENCES jobs ON DELETE CASCADE,
      employee_id uuid REFERENCES employees ON DELETE SET NULL,
      report_date date NOT NULL DEFAULT current_date,
      summary text,
      weather jsonb NOT NULL DEFAULT '{}'::jsonb,
      hours_worked numeric(6,2) DEFAULT 0,
      materials_used jsonb NOT NULL DEFAULT '[]'::jsonb,
      notes text,
      created_by uuid REFERENCES auth.users,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS daily_field_reports_lookup ON daily_field_reports(job_id, report_date);
  `);

  pgm.sql(`
    CREATE OR REPLACE VIEW customers AS
      SELECT id, name, contact_name, email, phone, address, city, state, postal_code, country
      FROM clients;
  `);

  const rlsTables = [
    "asset_assignments",
    "inventory_items",
    "inventory_transactions",
    "cost_catalog",
    "cost_items",
    "estimates",
    "estimate_line_items",
    "invoices",
    "invoice_items",
    "job_photos",
    "daily_field_reports",
  ];

  rlsTables.forEach((table) => {
    pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(
      `CREATE POLICY ${table}_select_authenticated ON ${table} FOR SELECT USING (app_public.is_authenticated());`,
    );
  });

  const ownerTables = [
    "asset_assignments",
    "inventory_items",
    "inventory_transactions",
    "cost_catalog",
    "cost_items",
    "estimates",
    "estimate_line_items",
    "invoices",
    "invoice_items",
    "job_photos",
    "daily_field_reports",
  ];

  ownerTables.forEach((table) => {
    pgm.sql(`
      CREATE POLICY ${table}_write_manage ON ${table}
        FOR ALL
        USING (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()))
        WITH CHECK (app_public.user_has_any_role(${ROLE_ARRAY}) OR (created_by IS NOT NULL AND created_by = auth.uid()));
    `);
  });
};

exports.down = (pgm) => {
  pgm.sql(`DROP VIEW IF EXISTS customers;`);

  [
    "daily_field_reports",
    "job_photos",
    "invoice_items",
    "invoices",
    "estimate_line_items",
    "estimates",
    "cost_items",
    "cost_catalog",
    "inventory_transactions",
    "inventory_items",
    "asset_assignments",
  ].forEach((table) => pgm.dropTable(table, { ifExists: true, cascade: true }));
};
