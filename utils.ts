import { createDefine } from "fresh";

// ─── Password Hashing (Web Crypto PBKDF2 -- no external deps) ───────────────

const HASH_ITERATIONS = 100_000;
const HASH_KEY_LENGTH = 32; // 256 bits

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: HASH_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    HASH_KEY_LENGTH * 8,
  );
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(hashArray).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2:${HASH_ITERATIONS}:${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Support legacy plain-text passwords (for migration from old data)
  if (!stored.startsWith("pbkdf2:")) {
    return password === stored;
  }
  const [, iterStr, saltHex, hashHex] = stored.split(":");
  const iterations = parseInt(iterStr, 10);
  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
  );
  const expectedHash = new Uint8Array(
    hashHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
  );
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    expectedHash.length * 8,
  );
  const derivedArray = new Uint8Array(derivedBits);
  // Constant-time comparison to prevent timing attacks
  if (derivedArray.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < derivedArray.length; i++) {
    diff |= derivedArray[i] ^ expectedHash[i];
  }
  return diff === 0;
}

// ─── Auth & Session Types ───────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  isFirstLogin: boolean;
  children: Child[];
  createdAt: number;
  /** "primary" = account owner, "authorized" = invited co-admin */
  role: "primary" | "authorized";
  /** If authorized, points to the primary user's ID whose data is shared */
  linkedAccountId?: string;
}

/** Internal record stored in KV (includes password) */
interface UserRecord extends User {
  passwordHash: string;
}

export interface Child {
  id: string;
  name: string;
  avatarUrl?: string;
  /** Emoji or key from DEFAULT_AVATARS; falls back to first letter of name */
  avatarIcon?: string;
  points: number;
  streak: number;
  tasks: Task[];
}

/** Default avatar icons users can pick from when adding a child */
export const DEFAULT_AVATARS: { key: string; emoji: string; label: string }[] = [
  { key: "star", emoji: "\u2B50", label: "Star" },
  { key: "flower", emoji: "\uD83C\uDF3B", label: "Flower" },
  { key: "football", emoji: "\uD83C\uDFC8", label: "Football" },
  { key: "hockey", emoji: "\uD83C\uDFD2", label: "Hockey" },
  { key: "soccer", emoji: "\u26BD", label: "Soccer" },
  { key: "basketball", emoji: "\uD83C\uDFC0", label: "Basketball" },
  { key: "unicorn", emoji: "\uD83E\uDD84", label: "Unicorn" },
  { key: "rocket", emoji: "\uD83D\uDE80", label: "Rocket" },
  { key: "rainbow", emoji: "\uD83C\uDF08", label: "Rainbow" },
  { key: "butterfly", emoji: "\uD83E\uDD8B", label: "Butterfly" },
  { key: "dinosaur", emoji: "\uD83E\uDD96", label: "Dinosaur" },
  { key: "dog", emoji: "\uD83D\uDC36", label: "Dog" },
  { key: "cat", emoji: "\uD83D\uDC31", label: "Cat" },
  { key: "bear", emoji: "\uD83D\uDC3B", label: "Bear" },
  { key: "crown", emoji: "\uD83D\uDC51", label: "Crown" },
  { key: "heart", emoji: "\u2764\uFE0F", label: "Heart" },
];

export interface Task {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  completed: boolean;
  completedAt?: number;
  category: TaskCategory;
}

export type TaskCategory =
  | "hygiene"
  | "chores"
  | "homework"
  | "kindness"
  | "exercise"
  | "custom";

export interface Session {
  userId: string;
  email: string;
  name: string;
  createdAt: number;
  expiresAt: number;
}

// ─── Route Types ────────────────────────────────────────────────────────────

export type PublicRoute =
  | "/"
  | "/onboard"
  | "/forgot"
  | "/reset";

export type AuthenticatedRoute =
  | "/welcome"
  | "/home"
  | "/tracker";

export type ApiRoute =
  | "/api/auth/login"
  | "/api/auth/logout"
  | "/api/auth/register"
  | "/api/auth/forgot"
  | "/api/auth/reset";

export type AppRoute = PublicRoute | AuthenticatedRoute | ApiRoute;

// ─── App State (passed through Fresh context) ───────────────────────────────

export interface State {
  title: string;
  session: Session | null;
  user: User | null;
}

export const define = createDefine<State>();

// ─── Deno KV Store ──────────────────────────────────────────────────────────
//
// Key structure:
//   ["users_by_email", email]      -> UserRecord
//   ["users_by_id", id]            -> email  (secondary index)
//   ["children_by_id", childId]    -> email  (secondary index)
//   ["sessions", sessionId]        -> Session  (with expireIn)
//   ["reset_tokens", token]        -> { email }  (with expireIn)
//   ["invite_tokens", token]       -> { primaryUserId, email }  (with expireIn)

const kv = await Deno.openKv();

// ─── Durations ───────────────────────────────────────────────────────────────

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000; // 1 hour
const INVITE_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Seed Admin User ─────────────────────────────────────────────────────────

async function seedAdminUser(): Promise<void> {
  const existing = await kv.get<UserRecord>(["users_by_email", "admin"]);
  if (existing.value) return; // already seeded

  const adminPassword = Deno.env.get("ADMIN_SEED_PASSWORD") || "password";
  const hashedPassword = await hashPassword(adminPassword);

  const record: UserRecord = {
    id: "user_001",
    email: "admin",
    name: "Admin User",
    passwordHash: hashedPassword,
    isFirstLogin: true,
    role: "primary",
    children: [
      {
        id: "child_001",
        name: "Alex",
        avatarIcon: "\uD83D\uDE80",
        points: 42,
        streak: 3,
        tasks: [
          { id: "task_001", title: "Brush teeth", description: "Brush teeth morning and night", pointValue: 5, completed: false, category: "hygiene" },
          { id: "task_002", title: "Make bed", description: "Make your bed before school", pointValue: 3, completed: false, category: "chores" },
          { id: "task_003", title: "Read for 20 minutes", description: "Read a book for at least 20 minutes", pointValue: 10, completed: false, category: "homework" },
        ],
      },
      {
        id: "child_002",
        name: "Jordan",
        avatarIcon: "\u26BD",
        points: 28,
        streak: 1,
        tasks: [
          { id: "task_004", title: "Pick up toys", description: "Put all toys back in the toy box", pointValue: 5, completed: false, category: "chores" },
          { id: "task_005", title: "Say something kind", description: "Give someone a genuine compliment", pointValue: 7, completed: false, category: "kindness" },
        ],
      },
    ],
    createdAt: Date.now(),
  };

  await kv.atomic()
    .set(["users_by_email", "admin"], record)
    .set(["users_by_id", "user_001"], "admin")
    .set(["children_by_id", "child_001"], "admin")
    .set(["children_by_id", "child_002"], "admin")
    .commit();
}

// Seed on module load
await seedAdminUser();

// ─── Internal Helpers ────────────────────────────────────────────────────────

function stripPassword(record: UserRecord): User {
  const { passwordHash: _, ...user } = record;
  return user;
}

async function getUserRecordByEmail(email: string): Promise<UserRecord | null> {
  const entry = await kv.get<UserRecord>(["users_by_email", email]);
  return entry.value;
}

async function getUserRecordById(id: string): Promise<UserRecord | null> {
  const emailEntry = await kv.get<string>(["users_by_id", id]);
  if (!emailEntry.value) return null;
  return await getUserRecordByEmail(emailEntry.value);
}

/** Save a user record back to KV (after mutation) */
async function saveUserRecord(record: UserRecord): Promise<void> {
  await kv.set(["users_by_email", record.email], record);
}

// ─── Auth Helpers ───────────────────────────────────────────────────────────

export async function authenticate(
  email: string,
  password: string,
): Promise<User | null> {
  const record = await getUserRecordByEmail(email);
  if (!record) return null;
  const valid = await verifyPassword(password, record.passwordHash);
  if (!valid) return null;

  // Migrate legacy plain-text passwords to hashed on successful login
  if (!record.passwordHash.startsWith("pbkdf2:")) {
    record.passwordHash = await hashPassword(password);
    await saveUserRecord(record);
  }

  return stripPassword(record);
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  linkedAccountId?: string,
): Promise<User | null> {
  const existing = await getUserRecordByEmail(email);
  if (existing) return null;

  const id = `user_${Date.now()}`;
  const hashedPassword = await hashPassword(password);
  const record: UserRecord = {
    id,
    email,
    name,
    passwordHash: hashedPassword,
    isFirstLogin: true,
    role: linkedAccountId ? "authorized" : "primary",
    linkedAccountId: linkedAccountId || undefined,
    children: [],
    createdAt: Date.now(),
  };

  await kv.atomic()
    .set(["users_by_email", email], record)
    .set(["users_by_id", id], email)
    .commit();

  return stripPassword(record);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const record = await getUserRecordByEmail(email);
  if (!record) return null;
  return stripPassword(record);
}

export async function resetPassword(
  email: string,
  newPassword: string,
): Promise<boolean> {
  const record = await getUserRecordByEmail(email);
  if (!record) return false;
  record.passwordHash = await hashPassword(newPassword);
  await saveUserRecord(record);
  return true;
}

// ─── Password Reset Tokens ──────────────────────────────────────────────────

export async function createResetToken(
  email: string,
): Promise<string | null> {
  const record = await getUserRecordByEmail(email);
  if (!record) return null;

  const token = crypto.randomUUID();
  await kv.set(
    ["reset_tokens", token],
    { email },
    { expireIn: RESET_TOKEN_DURATION_MS },
  );
  return token;
}

export async function validateResetToken(
  token: string,
): Promise<string | null> {
  const entry = await kv.get<{ email: string }>(["reset_tokens", token]);
  if (!entry.value) return null;
  return entry.value.email;
}

export async function consumeResetToken(
  token: string,
): Promise<string | null> {
  const email = await validateResetToken(token);
  if (email) {
    await kv.delete(["reset_tokens", token]);
  }
  return email;
}

// ─── Invite Tokens (authorized user invites) ────────────────────────────────

export async function createInviteToken(
  primaryUserId: string,
  email: string,
): Promise<string> {
  const token = crypto.randomUUID();
  await kv.set(
    ["invite_tokens", token],
    { primaryUserId, email },
    { expireIn: INVITE_TOKEN_DURATION_MS },
  );
  return token;
}

export async function validateInviteToken(
  token: string,
): Promise<{ primaryUserId: string; email: string } | null> {
  const entry = await kv.get<{ primaryUserId: string; email: string }>(
    ["invite_tokens", token],
  );
  return entry.value;
}

export async function consumeInviteToken(
  token: string,
): Promise<{ primaryUserId: string; email: string } | null> {
  const result = await validateInviteToken(token);
  if (result) {
    await kv.delete(["invite_tokens", token]);
  }
  return result;
}

// ─── Linked Account Resolution ───────────────────────────────────────────────

export async function resolveUserId(userId: string): Promise<string> {
  const record = await getUserRecordById(userId);
  if (record && record.linkedAccountId) {
    return record.linkedAccountId;
  }
  return userId;
}

export async function getUserById(id: string): Promise<User | null> {
  const record = await getUserRecordById(id);
  if (!record) return null;
  const user = stripPassword(record);

  // If authorized user, merge in the primary user's children
  if (user.linkedAccountId) {
    const primary = await getUserRecordById(user.linkedAccountId);
    if (primary) {
      return { ...user, children: primary.children };
    }
  }
  return user;
}

export async function markFirstLoginComplete(userId: string): Promise<void> {
  const record = await getUserRecordById(userId);
  if (!record) return;
  record.isFirstLogin = false;
  await saveUserRecord(record);
}

// ─── Ownership Verification ──────────────────────────────────────────────────

/** Verify that a child belongs to the given user (or their linked primary) */
export async function verifyChildOwnership(
  userId: string,
  childId: string,
): Promise<boolean> {
  const effectiveId = await resolveUserId(userId);
  const record = await getUserRecordById(effectiveId);
  if (!record) return false;
  return record.children.some((c) => c.id === childId);
}

// ─── Child Helpers ───────────────────────────────────────────────────────────

export async function getChildById(childId: string): Promise<Child | null> {
  // Use secondary index to find which user owns this child
  const emailEntry = await kv.get<string>(["children_by_id", childId]);
  if (!emailEntry.value) return null;

  const record = await getUserRecordByEmail(emailEntry.value);
  if (!record) return null;

  return record.children.find((c) => c.id === childId) || null;
}

/** Internal: find the owner email + record for a child */
async function getOwnerRecordForChild(
  childId: string,
): Promise<UserRecord | null> {
  const emailEntry = await kv.get<string>(["children_by_id", childId]);
  if (!emailEntry.value) return null;
  return await getUserRecordByEmail(emailEntry.value);
}

export async function addChildToUser(
  userId: string,
  name: string,
  avatarIcon?: string,
  avatarUrl?: string,
): Promise<Child | null> {
  const effectiveId = await resolveUserId(userId);
  const record = await getUserRecordById(effectiveId);
  if (!record) return null;

  const child: Child = {
    id: `child_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    avatarIcon: avatarIcon || undefined,
    avatarUrl: avatarUrl || undefined,
    points: 0,
    streak: 0,
    tasks: [],
  };

  record.children.push(child);
  await saveUserRecord(record);
  // Add secondary index for child lookup
  await kv.set(["children_by_id", child.id], record.email);
  return child;
}

// ─── Point & Child Management ───────────────────────────────────────────────

export async function adjustPoints(
  childId: string,
  delta: number,
): Promise<number | null> {
  const record = await getOwnerRecordForChild(childId);
  if (!record) return null;

  const child = record.children.find((c) => c.id === childId);
  if (!child) return null;

  child.points = Math.max(0, child.points + delta);
  await saveUserRecord(record);
  return child.points;
}

export async function cashInPoints(childId: string): Promise<boolean> {
  const record = await getOwnerRecordForChild(childId);
  if (!record) return false;

  const child = record.children.find((c) => c.id === childId);
  if (!child) return false;

  child.points = 0;
  await saveUserRecord(record);
  return true;
}

export async function removeChild(
  userId: string,
  childId: string,
): Promise<boolean> {
  const effectiveId = await resolveUserId(userId);
  const record = await getUserRecordById(effectiveId);
  if (!record) return false;

  const idx = record.children.findIndex((c) => c.id === childId);
  if (idx === -1) return false;

  record.children.splice(idx, 1);
  await saveUserRecord(record);
  // Remove secondary index
  await kv.delete(["children_by_id", childId]);
  return true;
}

export async function updateChild(
  childId: string,
  name: string,
  avatarIcon?: string,
  avatarUrl?: string,
): Promise<Child | null> {
  const record = await getOwnerRecordForChild(childId);
  if (!record) return null;

  const child = record.children.find((c) => c.id === childId);
  if (!child) return null;

  child.name = name;
  if (avatarIcon !== undefined) child.avatarIcon = avatarIcon || undefined;
  if (avatarUrl !== undefined) child.avatarUrl = avatarUrl || undefined;

  await saveUserRecord(record);
  return { ...child };
}

export async function toggleTask(
  childId: string,
  taskId: string,
): Promise<Task | null> {
  const record = await getOwnerRecordForChild(childId);
  if (!record) return null;

  const child = record.children.find((c) => c.id === childId);
  if (!child) return null;

  const task = child.tasks.find((t) => t.id === taskId);
  if (!task) return null;

  task.completed = !task.completed;
  task.completedAt = task.completed ? Date.now() : undefined;
  if (task.completed) {
    child.points += task.pointValue;
  } else {
    child.points = Math.max(0, child.points - task.pointValue);
  }

  await saveUserRecord(record);
  return task;
}

// ─── Session Helpers ────────────────────────────────────────────────────────

export async function createSession(user: User): Promise<string> {
  const sessionId = crypto.randomUUID();
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  await kv.set(
    ["sessions", sessionId],
    session,
    { expireIn: SESSION_DURATION_MS },
  );
  return sessionId;
}

export async function getSession(
  sessionId: string,
): Promise<Session | null> {
  const entry = await kv.get<Session>(["sessions", sessionId]);
  return entry.value;
}

export async function destroySession(sessionId: string): Promise<void> {
  await kv.delete(["sessions", sessionId]);
}

// ─── Cookie & Path Helpers (sync -- no KV needed) ───────────────────────────

export function getSessionIdFromCookie(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/pointy_session=([^;]+)/);
  return match ? match[1] : null;
}

const IS_PRODUCTION = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
const COOKIE_SECURE = IS_PRODUCTION ? "; Secure" : "";

export function setSessionCookie(sessionId: string): string {
  return `pointy_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${COOKIE_SECURE}`;
}

export function clearSessionCookie(): string {
  return `pointy_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${COOKIE_SECURE}`;
}

// ─── Public Routes Check ────────────────────────────────────────────────────

const PUBLIC_PATHS = new Set<string>([
  "/",
  "/onboard",
  "/forgot",
  "/reset",
]);

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/public/")) return true;
  if (pathname.startsWith("/_fresh/")) return true;
  return false;
}
