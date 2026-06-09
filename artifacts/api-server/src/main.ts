import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import helmet from "helmet";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.use(helmet());

  const allowedOrigins = (process.env["ALLOWED_ORIGINS"] ?? "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin:         allowedOrigins.includes("*") ? "*" : allowedOrigins,
    credentials:    true,
    methods:        ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      transform:            true,
      forbidNonWhitelisted: false,
      stopAtFirstError:     false,
    }),
  );

  const rawPort = process.env["PORT"];
  if (!rawPort) throw new Error("PORT environment variable is required.");
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${rawPort}"`);

  await app.listen(port, "0.0.0.0");
}

bootstrap().catch((err) => {
  console.error("[API] Fatal startup error:", err);
  process.exit(1);
});
