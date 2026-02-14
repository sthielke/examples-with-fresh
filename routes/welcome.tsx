import { define } from "../utils.ts";

export default define.page(function WelcomePage(ctx) {
  const user = ctx.state.user;
  ctx.state.title = "Welcome to Pointy!";

  return (
    <div class="welcome-page">
      <div class="welcome-emoji">🎉</div>
      <h1 class="welcome-title">
        Welcome, {user?.name ?? "there"}!
      </h1>
      <p class="welcome-text">
        You're all set! Pointy helps you track your kids' daily tasks and
        reward them with points. Let's get started by checking out your
        dashboard.
      </p>
      <img
        src="/pointy_logo_nobg.png"
        alt="Pointy"
        style="width: 120px; height: 120px; margin-bottom: 32px; border-radius: 50%; object-fit: cover;"
      />
      <a href="/home" class="btn btn-primary" style="max-width: 280px;">
        Go to Dashboard
      </a>
    </div>
  );
});
