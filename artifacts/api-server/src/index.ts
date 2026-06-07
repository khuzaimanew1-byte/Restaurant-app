import app from "./app";
import { logger } from "./lib/logger";
import { findUserByEmail, createUser } from "./lib/back4app";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function ensureAdminAccount() {
  const adminEmail = process.env.ADMIN_GMAIL;
  if (!adminEmail) {
    logger.warn("ADMIN_GMAIL not set — skipping admin init");
    return;
  }
  try {
    const existing = await findUserByEmail(adminEmail);
    if (!existing) {
      await createUser({
        email: adminEmail,
        passwordHash: null,
        role: "ADMIN",
        activated: false,
      });
      logger.info({ email: adminEmail }, "Admin account created");
    } else {
      logger.info({ email: adminEmail }, "Admin account already exists");
    }
  } catch (err) {
    logger.error({ err }, "Failed to ensure admin account");
  }
}

app.listen(port, async (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
  await ensureAdminAccount();
});
