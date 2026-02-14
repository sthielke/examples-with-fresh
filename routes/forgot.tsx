import { define } from "../utils.ts";
import ForgotForm from "../islands/ForgotForm.tsx";

export default define.page(function ForgotPage(_ctx) {
  return (
    <div class="auth-page">
      <div class="auth-card">
        <img
          class="auth-logo"
          src="/pointy_logo_nobg.png"
          alt="Pointy logo"
        />
        <h1 class="auth-title">Forgot Password</h1>
        <p class="auth-subtitle">
          Enter your email and we'll send you a reset link
        </p>
        <ForgotForm />
        <div class="form-footer">
          <p>
            <a href="/">Back to sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
});
