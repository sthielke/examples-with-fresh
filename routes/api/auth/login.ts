import {
  authenticate,
  createSession,
  define,
  setSessionCookie,
} from "../../../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const body = await ctx.req.json();
      const { email, password } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Email and password are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const user = authenticate(email, password);
      if (!user) {
        return new Response(
          JSON.stringify({ error: "Invalid email or password" }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }

      const sessionId = createSession(user);
      const redirect = user.isFirstLogin ? "/welcome" : "/home";

      return new Response(
        JSON.stringify({ success: true, redirect }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": setSessionCookie(sessionId),
          },
        },
      );
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
