import { brotliCompress, gzip } from "node:zlib";
import { promisify } from "node:util";
import type { RequestHandler, Response } from "express";

const br = promisify(brotliCompress);
const gz = promisify(gzip);
const min = 1024;

type Enc = "br" | "gzip";

function vary(res: Response, val: string): void {
  const cur = res.getHeader("Vary");
  const vals = String(cur ?? "")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);
  if (!vals.includes(val)) res.setHeader("Vary", [...vals, val].join(", "));
}

function enc(hdr: string | string[] | undefined): Enc | null {
  const val = Array.isArray(hdr) ? hdr.join(",") : hdr ?? "";
  if (val.includes("br")) return "br";
  if (val.includes("gzip")) return "gzip";
  return null;
}

function buf(src: unknown, encg?: BufferEncoding): Buffer {
  if (Buffer.isBuffer(src)) return src;
  if (src instanceof Uint8Array) return Buffer.from(src);
  return Buffer.from(String(src), encg);
}

function typ(res: Response): boolean {
  const val = res.getHeader("Content-Type");
  const txt = Array.isArray(val) ? val.join(";") : String(val ?? "");
  return /^(application\/json|application\/javascript|application\/xml|text\/)/i.test(txt);
}

function ok(res: Response, body: Buffer): boolean {
  const code = res.statusCode;
  return code >= 200
    && code !== 204
    && code !== 304
    && body.length >= min
    && !res.getHeader("Content-Encoding")
    && typ(res);
}

export function hdr(): RequestHandler {
  return (req, res, next) => {
    vary(res, "Authorization");
    vary(res, "Accept-Encoding");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (req.path === "/api/healthz") {
      res.setHeader("Cache-Control", "public, max-age=30");
    } else if (req.method === "GET" && req.path === "/api/employees") {
      res.setHeader("Cache-Control", "private, max-age=30");
    } else {
      res.setHeader("Cache-Control", "no-store");
    }
    next();
  };
}

export function tls(): RequestHandler {
  return (req, res, next) => {
    if (process.env["NODE_ENV"] !== "production") return next();
    const proto = req.headers["x-forwarded-proto"];
    const val = Array.isArray(proto) ? proto[0] : proto;
    if (req.secure || val === "https") return next();
    const host = req.headers.host;
    if (!host) return next();
    res.redirect(308, `https://${host}${req.originalUrl}`);
  };
}

export function cmp(): RequestHandler {
  return (req, res, next) => {
    const mode = enc(req.headers["accept-encoding"]);
    if (!mode || req.method === "HEAD") return next();

    const body: Buffer[] = [];
    const wr = res.write.bind(res);
    const end = res.end.bind(res);

    res.write = ((chunk: unknown, encg?: BufferEncoding | ((err?: Error) => void), cb?: (err?: Error) => void) => {
      if (chunk !== undefined) body.push(buf(chunk, typeof encg === "string" ? encg : undefined));
      if (typeof encg === "function") encg();
      if (cb) cb();
      return true;
    }) as typeof res.write;

    res.end = ((chunk?: unknown, encg?: BufferEncoding | (() => void), cb?: () => void) => {
      if (chunk !== undefined) body.push(buf(chunk, typeof encg === "string" ? encg : undefined));
      const raw = Buffer.concat(body);

      void (async () => {
        try {
          if (!ok(res, raw)) {
            if (raw.length) wr(raw);
            end();
            return;
          }
          const out = mode === "br" ? await br(raw) : await gz(raw);
          res.setHeader("Content-Encoding", mode);
          res.setHeader("Content-Length", String(out.length));
          vary(res, "Accept-Encoding");
          end(out);
        } catch {
          res.removeHeader("Content-Encoding");
          res.removeHeader("Content-Length");
          if (raw.length) wr(raw);
          end();
        } finally {
          if (typeof encg === "function") encg();
          if (cb) cb();
        }
      })();

      return res;
    }) as typeof res.end;

    next();
  };
}

