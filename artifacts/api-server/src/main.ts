import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import helmet from "helmet";
import type { Express } from "express";
import { AppModule } from "./app.module.js";
import { ErrFilter } from "./core/err.filter.js";
import { cmp, hdr, tls } from "./core/http.js";
import { cors } from "./core/cors.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const server = app.getHttpAdapter().getInstance() as Express;

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new ErrFilter());

  server.set("etag", "strong");
  server.set("trust proxy", 1);
  app.use(helmet());
  app.use(tls());
  app.use(cmp());
  app.use(hdr());
  app.enableCors(cors());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
    }),
  );

  const rawPort = process.env["PORT"];
  if (!rawPort) throw new Error("PORT environment variable is required.");
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${rawPort}"`);

  await app.listen(port, "0.0.0.0");
}

bootstrap().catch(() => {
  process.stderr.write("API startup failed\n");
  process.exit(1);
});
