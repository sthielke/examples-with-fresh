import { consumeResetToken, define, resetPassword } from "../../../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const body = await ctx.req.json();
      const { token, newPassword } = body;

      if (!token || !newPassword) {
        return new Response(
          JSON.stringify({ error: "Reset token and new password are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      if (newPassword.length < 12) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 12 characters" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Validate and consume the token (one-time use)
      const email = await consumeResetToken(token);

      if (!email) {
        return new Response(
          JSON.stringify({
            error: "This reset link is invalid or has expired. Please request a new one.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const success = await resetPassword(email, newPassword);

      if (!success) {
        return new Response(
          JSON.stringify({ error: "Could not reset password" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Your password has been reset. You can now sign in.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
