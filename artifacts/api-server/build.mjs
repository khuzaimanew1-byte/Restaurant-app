import { build as esbuild } from "esbuild";
import { readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const swcPlugin = {
  name: "swc-decorator-metadata",
  setup(build) {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const { transform } = require("@swc/core");
      const source = await readFile(args.path, "utf8");
      const isTs = args.path.endsWith(".ts") || args.path.endsWith(".tsx");
      const result = await transform(source, {
        filename: args.path,
        jsc: {
          parser: { syntax: isTs ? "typescript" : "ecmascript", decorators: true },
          transform: {
            decoratorMetadata: true,
            legacyDecorator: true,
          },
          target: "es2022",
        },
        sourceMaps: true,
        inlineSourcesContent: true,
      });
      return {
        contents: result.code,
        loader: "js",
      };
    });
  },
};

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/main.ts")],
    platform:    "node",
    bundle:      true,
    format:      "esm",
    outdir:      distDir,
    outExtension: { ".js": ".mjs" },
    logLevel:    "info",
    plugins:     [swcPlugin],
    external: [
      "@nestjs/*",
      "class-validator",
      "class-transformer",
      "reflect-metadata",
      "nestjs-pino",
      "pino-http",
      "pino",
      "pino-pretty",
      "*.node",
      "jsonwebtoken",
      "nodemailer",
      "helmet",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
    },
  });
}

buildAll().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
