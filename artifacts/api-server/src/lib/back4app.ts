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

const OPT = { useMasterKey: false } as const;
const em  = (e: string) => e.toLowerCase().trim();

function qr(cls: string) {
  const P = getClient();
  return new P.Query(P.Object.extend(cls));
}

function mk(cls: string) {
  const P = getClient();
  return new (P.Object.extend(cls))();
}

/* ─── AppUser ─── */
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
    passwordHash: (obj.get("passwordHash") as string | null) ?? null,
    role:         (obj.get("role") as "ADMIN" | "USER") ?? "USER",
    activated:    (obj.get("activated") as boolean) ?? false,
  };
}

export async function findUserByEmail(email: string): Promise<B4User | null> {
  const q = qr("AppUser");
  q.equalTo("email", em(email));
  q.limit(1);
  const r = await q.find(OPT);
  return r[0] ? toUser(r[0]) : null;
}

export async function createUser(fields: Partial<B4User> & { email: string }): Promise<B4User> {
  const o = mk("AppUser");
  o.set("email", em(fields.email));
  o.set("passwordHash", fields.passwordHash ?? null);
  o.set("role", fields.role ?? "USER");
  o.set("activated", fields.activated ?? false);
  return toUser(await o.save(null, OPT));
}

export async function updateUser(objectId: string, fields: Partial<B4User>): Promise<void> {
  const q = qr("AppUser");
  const o = await q.get(objectId, OPT);
  Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) o.set(k, v); });
  await o.save(null, OPT);
}

/* ─── OtpSession ─── */
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
    objectId:  obj.id,
    email:     obj.get("email") as string,
    otpHash:   obj.get("otpHash") as string,
    expiresAt: obj.get("expiresAt") as Date,
    attempts:  (obj.get("attempts") as number) ?? 0,
    used:      (obj.get("used") as boolean) ?? false,
  };
}

export async function findActiveOtpSession(email: string): Promise<B4OtpSession | null> {
  const q = qr("OtpSession");
  q.equalTo("email", em(email));
  q.equalTo("used", false);
  q.greaterThan("expiresAt", new Date());
  q.descending("createdAt");
  q.limit(1);
  const r = await q.find(OPT);
  return r[0] ? toSession(r[0]) : null;
}

export async function findLatestOtpSession(email: string): Promise<B4OtpSession | null> {
  const q = qr("OtpSession");
  q.equalTo("email", em(email));
  q.descending("createdAt");
  q.limit(1);
  const r = await q.find(OPT);
  return r[0] ? toSession(r[0]) : null;
}

export async function createOtpSession(email: string, otpHash: string, expiresAt: Date): Promise<B4OtpSession> {
  const o = mk("OtpSession");
  o.set("email", em(email));
  o.set("otpHash", otpHash);
  o.set("expiresAt", expiresAt);
  o.set("attempts", 0);
  o.set("used", false);
  return toSession(await o.save(null, OPT));
}

export async function invalidateOtpSessions(email: string): Promise<void> {
  const q = qr("OtpSession");
  q.equalTo("email", em(email));
  q.equalTo("used", false);
  const sessions = await q.find(OPT);
  await Promise.all(sessions.map(s => { s.set("used", true); return s.save(null, OPT); }));
}

export async function incrementOtpAttempts(objectId: string, currentAttempts: number): Promise<void> {
  const q = qr("OtpSession");
  const o = await q.get(objectId, OPT);
  o.set("attempts", currentAttempts + 1);
  await o.save(null, OPT);
}

export async function markOtpUsed(objectId: string): Promise<void> {
  const q = qr("OtpSession");
  const o = await q.get(objectId, OPT);
  o.set("used", true);
  await o.save(null, OPT);
}

/* ─── UserSession ─── */
export interface B4UserSession {
  objectId:  string;
  email:     string;
  role:      string;
  token:     string;
  expiresAt: Date;
}

function toUserSession(obj: Parse.Object): B4UserSession {
  return {
    objectId:  obj.id,
    email:     obj.get("email") as string,
    role:      obj.get("role")  as string,
    token:     obj.get("token") as string,
    expiresAt: obj.get("expiresAt") as Date,
  };
}

export async function createUserSession(
  email: string, role: string, token: string, expiresAt: Date,
): Promise<B4UserSession> {
  const o = mk("UserSession");
  o.set("email",     em(email));
  o.set("role",      role);
  o.set("token",     token);
  o.set("expiresAt", expiresAt);
  return toUserSession(await o.save(null, OPT));
}

export async function findUserSession(token: string): Promise<B4UserSession | null> {
  const q = qr("UserSession");
  q.equalTo("token", token);
  q.greaterThan("expiresAt", new Date());
  q.limit(1);
  const r = await q.find(OPT);
  return r[0] ? toUserSession(r[0]) : null;
}

export async function deleteUserSession(token: string): Promise<void> {
  const q = qr("UserSession");
  q.equalTo("token", token);
  const rows = await q.find(OPT);
  await Promise.all(rows.map(s => s.destroy(OPT)));
}
