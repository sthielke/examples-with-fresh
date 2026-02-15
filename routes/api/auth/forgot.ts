import { createResetToken, define, findUserByEmail } from "../../../utils.ts";
import { sendPasswordResetEmail } from "../../../email.ts";

// Generic success message -- same whether email exists or not (prevents enumeration)
const SUCCESS_MESSAGE =
  "If an account with that email exists, a password reset link has been sent. Check your inbox.";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const body = await ctx.req.json();
      const { email } = body;

      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Always return the same response to prevent user enumeration.
      // Only actually send the email if the user exists.
      const user = await findUserByEmail(email);

      if (user) {
        const token = await createResetToken(email);
        if (token) {
          const url = new URL(ctx.req.url);
          const resetUrl = `${url.origin}/reset?token=${token}`;
          await sendPasswordResetEmail(email, resetUrl);
          // We intentionally don't check the send result here --
          // the response is the same either way to prevent enumeration.
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: SUCCESS_MESSAGE }),
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
