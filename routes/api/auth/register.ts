import {
  consumeInviteToken,
  createInviteToken,
  createSession,
  define,
  registerUser,
  setSessionCookie,
} from "../../../utils.ts";
import { sendInviteEmail } from "../../../email.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const body = await ctx.req.json();
      const { email, password, name, inviteToken, authorizedEmail } = body;

      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({
            error: "Name, email, and password are required",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      if (password.length < 12) {
        return new Response(
          JSON.stringify({
            error: "Password must be at least 12 characters",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // ── Invite flow: authorized user registration ──────────────────
      let linkedAccountId: string | undefined;

      if (inviteToken) {
        const invite = consumeInviteToken(inviteToken);
        if (!invite) {
          return new Response(
            JSON.stringify({
              error: "Invalid or expired invite link",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        // Ensure the email matches the invite
        if (invite.email.toLowerCase() !== email.toLowerCase()) {
          return new Response(
            JSON.stringify({
              error:
                "Email does not match the invitation. Please use the email the invite was sent to.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        linkedAccountId = invite.primaryUserId;
      }

      // ── Register the user ──────────────────────────────────────────
      const user = registerUser(email, password, name, linkedAccountId);
      if (!user) {
        return new Response(
          JSON.stringify({
            error: "An account with this email already exists",
          }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        );
      }

      // ── Send invite to authorized user (primary flow only) ─────────
      if (authorizedEmail && !inviteToken) {
        try {
          const token = createInviteToken(user.id, authorizedEmail);
          const url = new URL(ctx.req.url);
          const inviteUrl = `${url.origin}/onboard?token=${token}`;
          await sendInviteEmail(authorizedEmail, inviteUrl, name);
        } catch (err) {
          // Log but don't fail registration if invite email fails
          console.error("Failed to send invite email:", err);
        }
      }

      // ── Create session and respond ─────────────────────────────────
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
