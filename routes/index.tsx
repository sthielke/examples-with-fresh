import { define } from "../utils.ts";
import LoginForm from "../islands/LoginForm.tsx";

export default define.page(function LoginPage(_ctx) {
  return (
    <div class="auth-page">
      <div class="auth-card">
        <img
          class="auth-logo"
          src="/pointy_logo_nobg.png"
          alt="Pointy logo"
        />
        <h1 class="auth-title">Pointy</h1>
        <p class="auth-subtitle">Track your kids' daily wins</p>
        <LoginForm />
        <div class="form-footer">
          <p>
            Don't have an account?{" "}
            <a href="/onboard">Create one</a>
          </p>
          <p style="margin-top: 8px;">
            <a href="/forgot">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  );
});
