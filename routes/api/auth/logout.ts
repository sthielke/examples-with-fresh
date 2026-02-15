import {
  clearSessionCookie,
  define,
  destroySession,
  getSessionIdFromCookie,
} from "../../../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const cookieHeader = ctx.req.headers.get("cookie");
    const sessionId = getSessionIdFromCookie(cookieHeader);

    if (sessionId) {
      await destroySession(sessionId);
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": clearSessionCookie(),
      },
    });
  },
});
