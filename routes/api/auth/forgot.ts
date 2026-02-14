import { createResetToken, define, findUserByEmail } from "../../../utils.ts";

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

      // Check if user exists
      const user = findUserByEmail(email);

      if (!user) {
        return new Response(
          JSON.stringify({ error: "No account found with that email address" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      // Generate a unique reset token
      const token = createResetToken(email);

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Could not generate reset link" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      // Build the reset URL
      const url = new URL(ctx.req.url);
      const resetUrl = `${url.origin}/reset?token=${token}`;

      // In a real app we'd send this via email.
      // For local dev, log it to the console AND return it in the response.
      console.log(`\n========================================`);
      console.log(`  PASSWORD RESET LINK for ${email}`);
      console.log(`  ${resetUrl}`);
      console.log(`========================================\n`);

      return new Response(
        JSON.stringify({
          success: true,
          message:
            "A password reset link has been sent to your email. Check your inbox.",
          // DEV ONLY: include the link so it's usable in the browser during local dev
          _dev_resetUrl: resetUrl,
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
