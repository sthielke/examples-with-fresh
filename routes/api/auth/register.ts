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
        const invite = await consumeInviteToken(inviteToken);
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
      const user = await registerUser(email, password, name, linkedAccountId);
      if (!user) {
        return new Response(
          JSON.stringify({
            error: "An account with this email already exists",
          }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        );
      }

      // ── Send invite to authorized user (primary flow only) ─────────
      let inviteWarning = "";
      if (authorizedEmail && !inviteToken) {
        try {
          const token = await createInviteToken(user.id, authorizedEmail);
          const url = new URL(ctx.req.url);
          const inviteUrl = `${url.origin}/onboard?token=${token}`;
          const sent = await sendInviteEmail(authorizedEmail, inviteUrl, name);
          if (!sent) {
            inviteWarning =
              "Your account was created, but we couldn't send the invite email. " +
              "Please check that your email configuration (RESEND_API_KEY and FROM_EMAIL) is set up with a verified domain.";
          }
        } catch (err) {
          console.error("Failed to send invite email:", err);
          inviteWarning =
            "Your account was created, but we couldn't send the invite email. " +
            "Please check your email configuration.";
        }
      }

      // ── Create session and respond ─────────────────────────────────
      const sessionId = await createSession(user);

      const responseBody: Record<string, unknown> = {
        success: true,
        redirect: "/welcome",
      };
      if (inviteWarning) {
        responseBody.inviteWarning = inviteWarning;
      }

      return new Response(
        JSON.stringify(responseBody),
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
