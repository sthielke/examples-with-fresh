import {
  createSession,
  define,
  registerUser,
  setSessionCookie,
} from "../../../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const body = await ctx.req.json();
      const { email, password, name } = body;

      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({ error: "Name, email, and password are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      if (password.length < 4) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 4 characters" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const user = registerUser(email, password, name);
      if (!user) {
        return new Response(
          JSON.stringify({ error: "An account with this email already exists" }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        );
      }

      const sessionId = createSession(user);

      return new Response(
        JSON.stringify({ success: true, redirect: "/welcome" }),
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
