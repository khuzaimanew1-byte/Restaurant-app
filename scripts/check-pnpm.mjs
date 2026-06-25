import { rm } from "node:fs/promises";

await Promise.all([
  rm("package-lock.json", { force: true }),
  rm("yarn.lock", { force: true }),
]);

if (!process.env["npm_config_user_agent"]?.startsWith("pnpm/")) {
  process.stderr.write("Use pnpm instead\n");
  process.exit(1);
}

