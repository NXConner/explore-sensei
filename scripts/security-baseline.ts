#!/usr/bin/env tsx
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPORTS_DIR = path.resolve(process.cwd(), "reports");

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

interface CommandResult {
  command: string;
  exitCode: number;
}

function run(command: string, args: string[], options: { cwd?: string } = {}): CommandResult {
  console.log(`[security] ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    cwd: options.cwd ?? process.cwd(),
    env: process.env,
  });

  if (result.error) {
    console.error(`[security] Failed to execute ${command}:`, result.error.message);
    return { command, exitCode: result.status ?? 1 };
  }

  return { command, exitCode: result.status ?? 0 };
}

const commands: Array<() => CommandResult> = [
  () => run("npm", ["audit", "--audit-level=high"]),
  () =>
    run("snyk", [
      "test",
      "--severity-threshold=high",
      `--json-file-output=${path.join(REPORTS_DIR, "snyk-report.json")}`,
    ]),
];

let highestExitCode = 0;
for (const execute of commands) {
  const { exitCode, command } = execute();
  highestExitCode = Math.max(highestExitCode, exitCode);
  if (exitCode !== 0) {
    console.warn(`[security] Command ${command} reported exit code ${exitCode}.`);
  }
}

if (highestExitCode !== 0) {
  console.error("[security] Baseline scan detected issues. Review the output above and address high severity findings.");
}

process.exit(highestExitCode);
