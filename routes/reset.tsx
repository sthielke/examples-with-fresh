import { define, validateResetToken } from "../utils.ts";
import ResetForm from "../islands/ResetForm.tsx";

export default define.page(async function ResetPage(ctx) {
  const url = new URL(ctx.req.url);
  const token = url.searchParams.get("token") || "";
  const email = token ? await validateResetToken(token) : null;

  // No token or expired/invalid token
  if (!token || !email) {
    return (
      <div class="auth-page">
        <div class="auth-card">
          <img
            class="auth-logo"
            src="/pointy_logo_nobg.png"
            alt="Pointy logo"
          />
          <h1 class="auth-title">Invalid Link</h1>
          <p class="auth-subtitle">
            This password reset link is invalid or has expired.
          </p>
          <div style="text-align: center; margin-top: 16px;">
            <a
              href="/forgot"
              class="btn btn-primary"
              style="display: inline-flex;"
            >
              Request a new link
            </a>
          </div>
          <div class="form-footer" style="margin-top: 16px;">
            <p>
              <a href="/">Back to sign in</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="auth-page">
      <div class="auth-card">
        <img
          class="auth-logo"
          src="/pointy_logo_nobg.png"
          alt="Pointy logo"
        />
        <h1 class="auth-title">Reset Password</h1>
        <p class="auth-subtitle">Choose a new password for your account</p>
        <ResetForm token={token} />
        <div class="form-footer">
          <p>
            <a href="/">Back to sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
});
