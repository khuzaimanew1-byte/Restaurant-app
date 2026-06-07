import Parse from "parse/node";

let initialized = false;

function getClient() {
  if (!initialized) {
    Parse.initialize(process.env.BACK4APP_APP_ID!, process.env.BACK4APP_JS_KEY!);
    (Parse as any).serverURL = "https://parseapi.back4app.com";
    initialized = true;
  }
  return Parse;
}

/* ─── AppUser ────────────────────────────────────────────────────── */
export interface B4User {
  objectId: string;
  email: string;
  passwordHash: string | null;
  role: "ADMIN" | "USER";
  activated: boolean;
}

function toUser(obj: Parse.Object): B4User {
  return {
    objectId:     obj.id,
    email:        obj.get("email") as string,
    passwordHash: obj.get("passwordHash") as string | null ?? null,
    role:         obj.get("role") as "ADMIN" | "USER" ?? "USER",
    activated:    obj.get("activated") as boolean ?? false,
  };
}

export async function findUserByEmail(email: string): Promise<B4User | null> {
  const P = getClient();
  const AppUser = P.Object.extend("AppUser");
  const q = new P.Query(AppUser);
  q.equalTo("email", email.toLowerCase().trim());
  q.limit(1);
  const results = await q.find({ useMasterKey: false });
  return results[0] ? toUser(results[0]) : null;
}

export async function createUser(fields: Partial<B4User> & { email: string }): Promise<B4User> {
  const P = getClient();
  const AppUser = P.Object.extend("AppUser");
  const obj = new AppUser();
  obj.set("email", fields.email.toLowerCase().trim());
  obj.set("passwordHash", fields.passwordHash ?? null);
  obj.set("role", fields.role ?? "USER");
  obj.set("activated", fields.activated ?? false);
  const saved = await obj.save(null, { useMasterKey: false });
  return toUser(saved);
}

export async function updateUser(objectId: string, fields: Partial<B4User>): Promise<void> {
  const P = getClient();
  const AppUser = P.Object.extend("AppUser");
  const q = new P.Query(AppUser);
  const obj = await q.get(objectId, { useMasterKey: false });
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined) obj.set(k, v);
  });
  await obj.save(null, { useMasterKey: false });
}

/* ─── OtpSession ─────────────────────────────────────────────────── */
export interface B4OtpSession {
  objectId: string;
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  used: boolean;
}

function toSession(obj: Parse.Object): B4OtpSession {
  return {
    objectId: obj.id,
    email:    obj.get("email") as string,
    otpHash:  obj.get("otpHash") as string,
    expiresAt: obj.get("expiresAt") as Date,
    attempts: obj.get("attempts") as number ?? 0,
    used:     obj.get("used") as boolean ?? false,
  };
}

export async function findActiveOtpSession(email: string): Promise<B4OtpSession | null> {
  const P = getClient();
  const OtpSession = P.Object.extend("OtpSession");
  const q = new P.Query(OtpSession);
  q.equalTo("email", email.toLowerCase().trim());
  q.equalTo("used", false);
  q.greaterThan("expiresAt", new Date());
  q.descending("createdAt");
  q.limit(1);
  const results = await q.find({ useMasterKey: false });
  return results[0] ? toSession(results[0]) : null;
}

export async function findLatestOtpSession(email: string): Promise<B4OtpSession | null> {
  const P = getClient();
  const OtpSession = P.Object.extend("OtpSession");
  const q = new P.Query(OtpSession);
  q.equalTo("email", email.toLowerCase().trim());
  q.descending("createdAt");
  q.limit(1);
  const results = await q.find({ useMasterKey: false });
  return results[0] ? toSession(results[0]) : null;
}

export async function createOtpSession(email: string, otpHash: string, expiresAt: Date): Promise<B4OtpSession> {
  const P = getClient();
  const OtpSession = P.Object.extend("OtpSession");
  const obj = new OtpSession();
  obj.set("email", email.toLowerCase().trim());
  obj.set("otpHash", otpHash);
  obj.set("expiresAt", expiresAt);
  obj.set("attempts", 0);
  obj.set("used", false);
  const saved = await obj.save(null, { useMasterKey: false });
  return toSession(saved);
}

export async function invalidateOtpSessions(email: string): Promise<void> {
  const P = getClient();
  const OtpSession = P.Object.extend("OtpSession");
  const q = new P.Query(OtpSession);
  q.equalTo("email", email.toLowerCase().trim());
  q.equalTo("used", false);
  const sessions = await q.find({ useMasterKey: false });
  await Promise.all(sessions.map(s => {
    s.set("used", true);
    return s.save(null, { useMasterKey: false });
  }));
}

export async function incrementOtpAttempts(objectId: string, currentAttempts: number): Promise<void> {
  const P = getClient();
  const OtpSession = P.Object.extend("OtpSession");
  const q = new P.Query(OtpSession);
  const obj = await q.get(objectId, { useMasterKey: false });
  obj.set("attempts", currentAttempts + 1);
  await obj.save(null, { useMasterKey: false });
}

export async function markOtpUsed(objectId: string): Promise<void> {
  const P = getClient();
  const OtpSession = P.Object.extend("OtpSession");
  const q = new P.Query(OtpSession);
  const obj = await q.get(objectId, { useMasterKey: false });
  obj.set("used", true);
  await obj.save(null, { useMasterKey: false });
}
