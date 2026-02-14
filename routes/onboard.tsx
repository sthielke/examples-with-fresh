import { define } from "../utils.ts";
import OnboardForm from "../islands/OnboardForm.tsx";

export default define.page(function OnboardPage(_ctx) {
  return (
    <div class="auth-page">
      <div class="auth-card">
        <img
          class="auth-logo"
          src="/pointy_logo_nobg.png"
          alt="Pointy logo"
        />
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Start tracking your kids' achievements</p>
        <OnboardForm />
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
