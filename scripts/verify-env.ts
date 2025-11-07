import fs from "node:fs";
import path from "node:path";
import process from "node:process";
interface CliOptions {
  files: string[];
  allowVaultPlaceholders: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  let allowVault = false;
  const files: string[] = [];
  let awaitingFileArgument = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    switch (arg) {
      case "--file":
      case "-f": {
        awaitingFileArgument = true;
        break;
      }
      case "--allow-vault-placeholders":
        allowVault = true;
        break;
      default:
        if (awaitingFileArgument) {
          files.push(arg);
          awaitingFileArgument = false;
        } else if (!arg.startsWith("-")) {
          files.push(arg);
        }
        break;
    }
  }

  if (awaitingFileArgument) {
    throw new Error("--file expects a path argument");
  }

  if (files.length === 0) {
    files.push(".env.local");
  }

  return { files, allowVaultPlaceholders: allowVault };
}

const VAULT_PREFIX = "vault:";
const BOOLEAN_VALUES = new Set(["true", "false"]);

function isVaultPlaceholder(value: string): boolean {
  return value.trim().toLowerCase().startsWith(VAULT_PREFIX);
}

function validatorEnum(allowed: string[]) {
  return (value: string): string | null =>
    allowed.includes(value) ? null : `must be one of ${allowed.join(", ")}, received "${value}"`;
}

function validatorUrl(value: string): string | null {
  try {
    new URL(value);
    return null;
  } catch {
    return "must be a valid URL";
  }
}

function validatorEmail(value: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? null : "must be a valid email address";
}

function validatorBoolean(value: string): string | null {
  return BOOLEAN_VALUES.has(value) ? null : 'must be "true" or "false"';
}

function validatorPostgres(value: string): string | null {
  return value.startsWith("postgres://") || value.startsWith("postgresql://")
    ? null
    : 'must be a postgres connection string beginning with "postgres://"';
}

function validatorNumeric({ integer = false, positive = false } = {}) {
  return (value: string): string | null => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "must be numeric";
    }
    if (integer && !Number.isInteger(numeric)) {
      return "must be an integer";
    }
    if (positive && numeric <= 0) {
      return "must be greater than zero";
    }
    return null;
  };
}

function validatorNonEmptyList(value: string): string | null {
  const list = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return list.length > 0 ? null : "must contain at least one comma-separated value";
}

function parseEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    const hashAfterSpace = value.indexOf(" #");
    const hashAfterTab = value.indexOf("\t#");
    const commentIndex = hashAfterSpace >= 0 ? hashAfterSpace : hashAfterTab;
    if (commentIndex >= 0) {
      value = value.slice(0, commentIndex).trim();
    }
    result[key] = value;
  }
  return result;
}

function loadEnvFile(filePath: string): Record<string, string> {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Environment file not found: ${resolved}`);
  }
  const content = fs.readFileSync(resolved, "utf-8");
  return parseEnv(content);
}

function validateFile(file: string, allowVault: boolean) {
  const envFromFile = loadEnvFile(file);
  const env = { ...process.env, ...envFromFile };

  const errors: string[] = [];
  const warnings: string[] = [];

  function requireValue(
    key: string,
    options: {
      optional?: boolean;
      validator?: (value: string) => string | null;
      allowVault?: boolean;
    } = {},
  ) {
    const raw = env[key];
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      if (!options.optional) {
        errors.push(`${key} is missing or empty`);
      }
      return;
    }

    const value = String(raw).trim();
    if (isVaultPlaceholder(value) && !(allowVault || options.allowVault)) {
      errors.push(`${key} still references a vault placeholder; hydrate secrets before runtime.`);
      return;
    }

    if (options.validator) {
      const message = options.validator(value);
      if (message) {
        errors.push(`${key} ${message}`);
      }
    }
  }

  // Core context
  requireValue("ENVIRONMENT", { validator: validatorEnum(["development", "test", "staging", "production"]) });
  requireValue("NODE_ENV", { validator: validatorEnum(["development", "test", "staging", "production"]) });
  requireValue("VITE_APP_ENV");
  requireValue("VITE_DEPLOYMENT_REGION");
  requireValue("VITE_RELEASE_VERSION");
  requireValue("VITE_COMMIT_SHA");
  requireValue("APP_TIMEZONE");

  // Supabase
  requireValue("SUPABASE_VAULT_PATH");
  requireValue("VITE_SUPABASE_URL", { validator: validatorUrl });
  requireValue("VITE_SUPABASE_ANON_KEY", { allowVault });
  requireValue("SUPABASE_SERVICE_ROLE_KEY", { allowVault });
  requireValue("SUPABASE_JWT_SECRET", { allowVault });
  requireValue("SUPABASE_SITE_URL", { validator: validatorUrl });
  requireValue("DATABASE_URL", { validator: validatorPostgres });
  requireValue("SUPABASE_DB_SSL", { validator: validatorEnum(["disable", "prefer", "require"]) });
  requireValue("SUPABASE_STORAGE_BUCKET");

  // SMTP
  requireValue("SUPABASE_SMTP_ADMIN_EMAIL", { validator: validatorEmail });
  requireValue("SUPABASE_SMTP_HOST");
  requireValue("SUPABASE_SMTP_PORT", { validator: validatorNumeric({ integer: true, positive: true }) });
  requireValue("SUPABASE_SMTP_USER", { optional: true, allowVault });
  requireValue("SUPABASE_SMTP_PASS", { optional: true, allowVault });

  // HUD / feature flags
  [
    "DIVISION_THEME_ENABLED",
    "DIVISION_HUD_ENABLED",
    "TACTICAL_MAP_ENABLED",
    "MISSION_PORTAL_ALPHA",
    "AI_INTEL_LABS",
    "VITE_THEME_ALLOW_CUSTOM_UPLOADS",
    "VITE_GAMIFY_ENABLED",
  ].forEach((key) => requireValue(key, { validator: validatorBoolean }));
  requireValue("VITE_DEFAULT_THEME_PRESET");
  requireValue("VITE_DEFAULT_WALLPAPER");
  requireValue("VITE_THEME_WALLPAPER_STORAGE");
  requireValue("VITE_THEME_ASSET_BASE_URL");

  // Mapping
  requireValue("MAPS_VAULT_PATH");
  requireValue("VITE_GOOGLE_MAPS_API_KEY", { allowVault });
  requireValue("VITE_GOOGLE_MAPS_API_KEY_ALT", { allowVault });
  requireValue("VITE_MAPBOX_ACCESS_TOKEN", { allowVault });
  requireValue("VITE_MAPTILER_API_KEY", { optional: true, allowVault });
  requireValue("VITE_MAPLIBRE_STYLE_URL");
  requireValue("VITE_PARCELS_TILES_TEMPLATE");
  requireValue("VITE_MAPS_GEOCODER_PROVIDER", { validator: validatorEnum(["google", "nominatim"]) });
  requireValue("VITE_MAPS_ROUTING_PROVIDER", { validator: validatorEnum(["google", "osrm"]) });
  requireValue("VITE_MAPS_ELEVATION_PROVIDER", { validator: validatorEnum(["google", "open_elevation"]) });
  ["VITE_USGS_IMAGERY_WMS_URL", "VITE_USDA_NAIP_WMS_URL", "VITE_PATRICK_WMS_URL", "VITE_PATRICK_ESRI_FEATURE_URL"].forEach(
    (key) => requireValue(key, { optional: true, validator: validatorUrl }),
  );
  requireValue("VITE_BASEMAP_PMTILES_URL", { optional: true });

  // Observability
  requireValue("OBS_VAULT_PATH");
  requireValue("VITE_OTEL_EXPORT_URL", { validator: validatorUrl });
  requireValue("VITE_OTEL_EXPORT_API_KEY", { allowVault });
  requireValue("VITE_TELEMETRY_ENVIRONMENT");
  requireValue("VITE_LOG_SINK_URL", { validator: validatorUrl });
  requireValue("VITE_LOG_SINK_KEY", { allowVault });
  requireValue("VITE_LOG_CORRELATION_ID");

  // Weather
  requireValue("WEATHER_VAULT_PATH");
  requireValue("VITE_OPENWEATHER_API_KEY", { allowVault });
  requireValue("VITE_WEATHER_ALERT_WEBHOOK", { optional: true, validator: validatorUrl });

  // AI / ML
  requireValue("AI_VAULT_PATH");
  requireValue("VITE_AI_SERVICE_URL", { validator: validatorUrl });
  requireValue("VITE_AI_SERVICE_KEY", { allowVault });
  requireValue("VITE_VALID_API_KEYS", { validator: validatorNonEmptyList });
  requireValue("VITE_MLAPI_URL", { validator: validatorUrl });
  requireValue("VITE_ASPHALT_ML_URL", { validator: validatorUrl });
  requireValue("VITE_FEATURE_FLAGS", { validator: validatorNonEmptyList });
  requireValue("LOVABLE_API_KEY", { allowVault });

  // Notifications & integrations
  requireValue("VITE_MISSION_ALERT_WEBHOOK", { validator: validatorUrl });
  requireValue("VITE_MISSION_SILENT_HOURS");
  requireValue("SLACK_WEBHOOK_URL", { optional: true, validator: validatorUrl });
  requireValue("MICROSOFT_TEAMS_WEBHOOK_URL", { optional: true, validator: validatorUrl });

  // Compliance / auditing
  requireValue("COMPLIANCE_LOG_BUCKET");
  requireValue("DATA_RETENTION_DAYS", { validator: validatorNumeric({ integer: true, positive: true }) });

  requireValue("VITE_MAPLIBRE_PM_CACHE_SIZE", { validator: validatorNumeric({ integer: true, positive: true }) });
  requireValue("VITE_MAPTILER_REGION_HINT");

  if (errors.length > 0) {
    console.error(`\n[env] ❌ ${file} failed validation:`);
    errors.forEach((error) => console.error(`  • ${error}`));
    process.exit(1);
  }

  const stage = env.ENVIRONMENT ?? "unknown";
  if (!env.VITE_WEATHER_ALERT_WEBHOOK) {
    warnings.push("VITE_WEATHER_ALERT_WEBHOOK is unset; severe weather alerts will not reach crews.");
  }
  if (!env.SLACK_WEBHOOK_URL && stage !== "production") {
    warnings.push("SLACK_WEBHOOK_URL is unset; alerts will stay in-app only.");
  }

  console.log(`[env] ✅ ${file} validated for ${stage} stage.`);
  if (warnings.length > 0) {
    console.warn("[env] ⚠️  Non-blocking warnings:");
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
}

function main() {
  const options = parseArgs();
  for (const file of options.files) {
    validateFile(file, options.allowVaultPlaceholders);
  }
}

try {
  main();
} catch (error) {
  console.error("[env] ❌ verification failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
