import { App, staticFiles } from "fresh";
import {
  define,
  getSession,
  getSessionIdFromCookie,
  getUserById,
  isPublicPath,
  type State,
} from "./utils.ts";

export const app = new App<State>();

// ─── Serve static files from /public as /public/* ───────────────────────────
app.use(staticFiles());

// ─── Auth Middleware ─────────────────────────────────────────────────────────
// Runs on every request: resolves session from cookie, protects auth routes
const authMiddleware = define.middleware((ctx) => {
  const cookieHeader = ctx.req.headers.get("cookie");
  const sessionId = getSessionIdFromCookie(cookieHeader);

  // Default state
  ctx.state.title = "Pointy";
  ctx.state.session = null;
  ctx.state.user = null;

  if (sessionId) {
    const session = getSession(sessionId);
    if (session) {
      ctx.state.session = session;
      ctx.state.user = getUserById(session.userId);
    }
  }

  // Check if route requires authentication
  const url = new URL(ctx.req.url);
  const pathname = url.pathname;

  if (!isPublicPath(pathname) && !ctx.state.session) {
    // Redirect unauthenticated users to login
    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  }

  // If authenticated user visits login page, redirect to home
  if (pathname === "/" && ctx.state.session) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/home" },
    });
  }

  return ctx.next();
});

app.use(authMiddleware);

// ─── Request Logger (dev) ───────────────────────────────────────────────────
const loggerMiddleware = define.middleware((ctx) => {
  const start = Date.now();
  const result = ctx.next();
  const ms = Date.now() - start;
  console.log(`${ctx.req.method} ${new URL(ctx.req.url).pathname} ${ms}ms`);
  return result;
});

app.use(loggerMiddleware);

// ─── File-system routes ─────────────────────────────────────────────────────
app.fsRoutes();
