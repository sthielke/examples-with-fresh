import { define, validateInviteToken } from "../utils.ts";
import OnboardForm from "../islands/OnboardForm.tsx";

export default define.page(function OnboardPage(ctx) {
  const url = new URL(ctx.req.url);
  const token = url.searchParams.get("token") || "";

  // If an invite token is present, validate it and pre-fill the email
  let inviteEmail = "";
  let validToken = false;
  if (token) {
    const invite = validateInviteToken(token);
    if (invite) {
      inviteEmail = invite.email;
      validToken = true;
    }
  }

  const isInviteFlow = !!token;
  const subtitle = isInviteFlow && validToken
    ? "You've been invited to join a Pointy account"
    : "Start tracking your kids' achievements";

  return (
    <div class="auth-page">
      <div class="auth-card">
        <img
          class="auth-logo"
          src="/pointy_logo_nobg.png"
          alt="Pointy logo"
        />
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">{subtitle}</p>

        {isInviteFlow && !validToken
          ? (
            <div class="alert alert-error" style="margin-bottom: 16px;">
              This invite link is invalid or has expired. Please ask the person
              who invited you to send a new one.
            </div>
          )
          : (
            <OnboardForm
              inviteToken={validToken ? token : ""}
              inviteEmail={inviteEmail}
            />
          )}

        <div class="form-footer">
          <p>
            Already have an account?{" "}
            <a href="/">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
});
