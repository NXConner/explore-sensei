import "dotenv/config";
import path from "node:path";
import process from "node:process";
import { migrate, RunnerOption } from "node-pg-migrate";

type Direction = "up" | "down" | "redo" | "reset" | "status";

const direction = (process.argv[2] as Direction | undefined) ?? "up";
const countArg = process.argv[3];
const count = countArg ? Number.parseInt(countArg, 10) : undefined;

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DB_URL ??
  process.env.SUPABASE_DB_URL_LOCAL ??
  process.env.SUPABASE_DB_CONNECTION ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_CONNECTION_STRING ??
  process.env.SUPABASE_DB_URL_SERVICE;

if (!databaseUrl) {
  console.error(
    "[db:migrate] DATABASE_URL (or SUPABASE_DATABASE_URL/SUPABASE_DB_URL) is not set. Export it before running migrations.",
  );
  process.exit(1);
}

const migrationsDir = path.resolve(process.cwd(), "db/migrations");

const baseOptions: RunnerOption = {
  databaseUrl,
  dir: migrationsDir,
  direction: "up",
  migrationsTable: "app_schema_migrations",
  logger: {
    debug: () => undefined,
    info: (msg) => console.info(`[db:migrate] ${msg}`),
    warn: (msg) => console.warn(`[db:migrate] ${msg}`),
    error: (msg) => console.error(`[db:migrate] ${msg}`),
  },
  noLock: false,
  verbose: false,
};

async function runMigrations() {
  switch (direction) {
    case "up": {
      const executed = await migrate({ ...baseOptions, direction: "up", count });
      logExecuted("Applied", executed);
      break;
    }
    case "down": {
      const executed = await migrate({
        ...baseOptions,
        direction: "down",
        count: count ?? 1,
      });
      logExecuted("Reverted", executed);
      break;
    }
    case "redo": {
      const downCount = count ?? 1;
      const reverted = await migrate({
        ...baseOptions,
        direction: "down",
        count: downCount,
      });
      logExecuted("Reverted", reverted);
      const reApplied = await migrate({
        ...baseOptions,
        direction: "up",
        count: downCount,
      });
      logExecuted("Re-applied", reApplied);
      break;
    }
    case "reset": {
      const reverted = await migrate({
        ...baseOptions,
        direction: "down",
        count: Number.MAX_SAFE_INTEGER,
      });
      logExecuted("Reverted", reverted);
      const reApplied = await migrate({ ...baseOptions, direction: "up" });
      logExecuted("Applied", reApplied);
      break;
    }
    case "status": {
      const pending = await migrate({
        ...baseOptions,
        direction: "up",
        dryRun: true,
      });
      const applied = await migrate({
        ...baseOptions,
        direction: "down",
        dryRun: true,
      });
      if (applied.length === 0) {
        console.info("[db:migrate] No migrations have been applied yet.");
      } else {
        console.info("[db:migrate] Applied migrations:");
        applied.forEach((m) => console.info(`  - ${m.name}`));
      }
      if (pending.length === 0) {
        console.info("[db:migrate] No pending migrations.");
      } else {
        console.info("[db:migrate] Pending migrations:");
        pending.forEach((m) => console.info(`  - ${m.name}`));
      }
      break;
    }
    default: {
      console.error(`[db:migrate] Unsupported command "${direction}".`);
      process.exit(1);
    }
  }
}

function logExecuted(action: string, migrations: { name: string }[]) {
  if (!migrations.length) {
    console.info(`[db:migrate] ${action} 0 migrations.`);
    return;
  }
  console.info(`[db:migrate] ${action} ${migrations.length} migration(s):`);
  migrations.forEach((m) => console.info(`  - ${m.name}`));
}

runMigrations().catch((error) => {
  console.error("[db:migrate] Migration command failed:", error);
  process.exit(1);
});
