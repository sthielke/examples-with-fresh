import { createDefine } from "fresh";

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

// ─── In-Memory Mock Store ───────────────────────────────────────────────────

const mockUsers: Map<string, User & { passwordHash: string }> = new Map();
const sessions: Map<string, Session> = new Map();

// Seed a default admin user on import
mockUsers.set("admin", {
  id: "user_001",
  email: "admin",
  name: "Admin User",
  passwordHash: "password", // plain text for mock
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
        {
          id: "task_001",
          title: "Brush teeth",
          description: "Brush teeth morning and night",
          pointValue: 5,
          completed: false,
          category: "hygiene",
        },
        {
          id: "task_002",
          title: "Make bed",
          description: "Make your bed before school",
          pointValue: 3,
          completed: false,
          category: "chores",
        },
        {
          id: "task_003",
          title: "Read for 20 minutes",
          description: "Read a book for at least 20 minutes",
          pointValue: 10,
          completed: false,
          category: "homework",
        },
      ],
    },
    {
      id: "child_002",
      name: "Jordan",
      avatarIcon: "\u26BD",
      points: 28,
      streak: 1,
      tasks: [
        {
          id: "task_004",
          title: "Pick up toys",
          description: "Put all toys back in the toy box",
          pointValue: 5,
          completed: false,
          category: "chores",
        },
        {
          id: "task_005",
          title: "Say something kind",
          description: "Give someone a genuine compliment",
          pointValue: 7,
          completed: false,
          category: "kindness",
        },
      ],
    },
  ],
  createdAt: Date.now(),
});

// ─── Auth Helpers ───────────────────────────────────────────────────────────

export function authenticate(
  email: string,
  password: string,
): User | null {
  const record = mockUsers.get(email);
  if (!record || record.passwordHash !== password) return null;
  const { passwordHash: _, ...user } = record;
  return user;
}

export function registerUser(
  email: string,
  password: string,
  name: string,
  linkedAccountId?: string,
): User | null {
  if (mockUsers.has(email)) return null;
  const user: User & { passwordHash: string } = {
    id: `user_${Date.now()}`,
    email,
    name,
    passwordHash: password,
    isFirstLogin: true,
    role: linkedAccountId ? "authorized" : "primary",
    linkedAccountId: linkedAccountId || undefined,
    children: [],
    createdAt: Date.now(),
  };
  mockUsers.set(email, user);
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export function findUserByEmail(email: string): User | null {
  const record = mockUsers.get(email);
  if (!record) return null;
  const { passwordHash: _, ...user } = record;
  return user;
}

export function resetPassword(email: string, newPassword: string): boolean {
  const record = mockUsers.get(email);
  if (!record) return false;
  record.passwordHash = newPassword;
  return true;
}

// ─── Password Reset Tokens ──────────────────────────────────────────────────

interface ResetToken {
  email: string;
  createdAt: number;
  expiresAt: number;
}

const resetTokens: Map<string, ResetToken> = new Map();
const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000; // 1 hour

export function createResetToken(email: string): string | null {
  // Only create token if user exists
  if (!mockUsers.has(email)) return null;

  const token = crypto.randomUUID();
  resetTokens.set(token, {
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + RESET_TOKEN_DURATION_MS,
  });
  return token;
}

export function validateResetToken(token: string): string | null {
  const entry = resetTokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    resetTokens.delete(token);
    return null;
  }
  return entry.email;
}

export function consumeResetToken(token: string): string | null {
  const email = validateResetToken(token);
  if (email) {
    resetTokens.delete(token);
  }
  return email;
}

// ─── Invite Tokens (authorized user invites) ────────────────────────────────

interface InviteToken {
  primaryUserId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

const inviteTokens: Map<string, InviteToken> = new Map();
const INVITE_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createInviteToken(
  primaryUserId: string,
  email: string,
): string {
  const token = crypto.randomUUID();
  inviteTokens.set(token, {
    primaryUserId,
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + INVITE_TOKEN_DURATION_MS,
  });
  return token;
}

export function validateInviteToken(
  token: string,
): { primaryUserId: string; email: string } | null {
  const entry = inviteTokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    inviteTokens.delete(token);
    return null;
  }
  return { primaryUserId: entry.primaryUserId, email: entry.email };
}

export function consumeInviteToken(
  token: string,
): { primaryUserId: string; email: string } | null {
  const result = validateInviteToken(token);
  if (result) {
    inviteTokens.delete(token);
  }
  return result;
}

// ─── Linked Account Resolution ───────────────────────────────────────────────

/**
 * Resolves the effective user ID for data operations.
 * If the user is an authorized user, returns the primary user's ID.
 * Otherwise returns the user's own ID.
 */
export function resolveUserId(userId: string): string {
  for (const record of mockUsers.values()) {
    if (record.id === userId && record.linkedAccountId) {
      return record.linkedAccountId;
    }
  }
  return userId;
}

export function getUserById(id: string): User | null {
  for (const record of mockUsers.values()) {
    if (record.id === id) {
      const { passwordHash: _, ...user } = record;
      // If authorized user, merge in the primary user's children
      if (user.linkedAccountId) {
        const primary = getPrimaryUserRecord(user.linkedAccountId);
        if (primary) {
          return { ...user, children: primary.children };
        }
      }
      return user;
    }
  }
  return null;
}

/** Internal: get the raw record for a primary user by ID */
function getPrimaryUserRecord(
  userId: string,
): (User & { passwordHash: string }) | null {
  for (const record of mockUsers.values()) {
    if (record.id === userId) return record;
  }
  return null;
}

export function markFirstLoginComplete(userId: string): void {
  for (const record of mockUsers.values()) {
    if (record.id === userId) {
      record.isFirstLogin = false;
      break;
    }
  }
}

export function toggleTask(childId: string, taskId: string): Task | null {
  for (const record of mockUsers.values()) {
    for (const child of record.children) {
      if (child.id === childId) {
        const task = child.tasks.find((t) => t.id === taskId);
        if (task) {
          task.completed = !task.completed;
          task.completedAt = task.completed ? Date.now() : undefined;
          if (task.completed) {
            child.points += task.pointValue;
          } else {
            child.points = Math.max(0, child.points - task.pointValue);
          }
          return task;
        }
      }
    }
  }
  return null;
}

export function getChildById(childId: string): Child | null {
  for (const record of mockUsers.values()) {
    const child = record.children.find((c) => c.id === childId);
    if (child) return child;
  }
  return null;
}

export function addChildToUser(
  userId: string,
  name: string,
  avatarIcon?: string,
  avatarUrl?: string,
): Child | null {
  const effectiveId = resolveUserId(userId);
  for (const record of mockUsers.values()) {
    if (record.id === effectiveId) {
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
      return child;
    }
  }
  return null;
}

// ─── Point & Child Management ───────────────────────────────────────────────

export function adjustPoints(childId: string, delta: number): number | null {
  for (const record of mockUsers.values()) {
    for (const child of record.children) {
      if (child.id === childId) {
        child.points = Math.max(0, child.points + delta);
        return child.points;
      }
    }
  }
  return null;
}

export function cashInPoints(childId: string): boolean {
  for (const record of mockUsers.values()) {
    for (const child of record.children) {
      if (child.id === childId) {
        child.points = 0;
        return true;
      }
    }
  }
  return false;
}

export function removeChild(userId: string, childId: string): boolean {
  const effectiveId = resolveUserId(userId);
  for (const record of mockUsers.values()) {
    if (record.id === effectiveId) {
      const idx = record.children.findIndex((c) => c.id === childId);
      if (idx !== -1) {
        record.children.splice(idx, 1);
        return true;
      }
    }
  }
  return false;
}

export function updateChild(
  childId: string,
  name: string,
  avatarIcon?: string,
  avatarUrl?: string,
): Child | null {
  for (const record of mockUsers.values()) {
    for (const child of record.children) {
      if (child.id === childId) {
        child.name = name;
        if (avatarIcon !== undefined) child.avatarIcon = avatarIcon || undefined;
        if (avatarUrl !== undefined) child.avatarUrl = avatarUrl || undefined;
        return { ...child };
      }
    }
  }
  return null;
}

// ─── Session Helpers ────────────────────────────────────────────────────────

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function createSession(user: User): string {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });
  return sessionId;
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function getSessionIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/pointy_session=([^;]+)/);
  return match ? match[1] : null;
}

export function setSessionCookie(sessionId: string): string {
  return `pointy_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
}

export function clearSessionCookie(): string {
  return `pointy_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
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
