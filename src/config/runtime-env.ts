import { z } from "zod";
import { logger } from "@/lib/monitoring";

const vaultAwareString = z
  .string()
  .min(1)
  .refine(
    (value) => !value.trim().startsWith("vault:"),
    "Runtime environment received an unresolved vault placeholder. Ensure secret injection ran before starting the client.",
  );

const runtimeEnvSchema = z.object({
  appEnv: z.string(),
  supabaseUrl: z.string().url("VITE_SUPABASE_URL must be a valid URL"),
  supabaseAnonKey: vaultAwareString,
  googleMapsPrimaryKey: vaultAwareString.optional(),
  mapboxAccessToken: z.string().optional(),
  telemetryEnvironment: z.string().optional(),
  otelExportUrl: z.string().url().optional(),
  featureFlags: z
    .string()
    .transform((value) => value.split(",").map((flag) => flag.trim()).filter(Boolean))
    .default([]),
});

type RuntimeEnv = z.infer<typeof runtimeEnvSchema>;

function buildRuntimeEnv(): RuntimeEnv {
  const raw = {
    appEnv: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    googleMapsPrimaryKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    mapboxAccessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
    telemetryEnvironment: import.meta.env.VITE_TELEMETRY_ENVIRONMENT,
    otelExportUrl: import.meta.env.VITE_OTEL_EXPORT_URL,
    featureFlags: import.meta.env.VITE_FEATURE_FLAGS ?? "",
  };

  const parsed = runtimeEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const formatted = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    logger.error("Runtime environment validation failed", {
      issues: formatted,
    });
    throw new Error(`Runtime environment missing critical configuration:\n${formatted.join("\n")}`);
  }
  return parsed.data;
}

export const runtimeEnv = buildRuntimeEnv();
