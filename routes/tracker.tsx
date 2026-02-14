import { define } from "../utils.ts";
import TrackerView from "../islands/TrackerView.tsx";

export default define.page(function TrackerPage(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return (
      <div class="auth-page">
        <p>Please <a href="/">sign in</a> to view the tracker.</p>
      </div>
    );
  }

  ctx.state.title = "Point Tracker - Pointy";

  const children = user.children.map((c) => ({
    id: c.id,
    name: c.name,
    points: c.points,
    avatarIcon: c.avatarIcon || "",
    avatarUrl: c.avatarUrl || "",
  }));

  return (
    <div>
      {/* Pointy Header (no sign out -- child-facing page) */}
      <header class="pointy-header">
        <div class="pointy-header-inner">
          <div class="pointy-header-brand">
            <img
              src="/pointy_logo_nobg.png"
              alt="Pointy"
              class="pointy-header-logo"
            />
            <span class="pointy-header-title">Pointy</span>
          </div>
        </div>
      </header>

      <TrackerView initialChildren={children} />
    </div>
  );
});
