export function cors() {
  const prod = process.env["NODE_ENV"] === "production";
  const orgs = (process.env["ALLOWED_ORIGINS"] ?? "")
    .split(",")
    .map(org => org.trim())
    .filter(Boolean);

  if (prod && (!orgs.length || orgs.includes("*"))) {
    throw new Error("ALLOWED_ORIGINS must list production origins.");
  }

  return {
    origin: orgs.length ? orgs : !prod,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["ETag", "Last-Modified", "Cache-Control"],
  };
}

