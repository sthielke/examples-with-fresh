import { define } from "../utils.ts";
import ChildRow from "../islands/ChildRow.tsx";
import AddChildForm from "../islands/AddChildForm.tsx";

export default define.page(function HomePage(ctx) {
  const user = ctx.state.user;
  ctx.state.title = "Pointy";

  if (!user) {
    return (
      <div class="auth-page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Pointy Header */}
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
          <div class="pointy-header-actions">
            <a href="/tracker" class="pointy-header-tracker-link" title="Open point tracker for kids">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Tracker
            </a>
            <form method="POST" action="/api/auth/logout">
              <button type="submit" class="pointy-header-signout">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Children List */}
      <div class="container-wide" style="padding-top: 28px; padding-bottom: 40px;">
        {user.children.length === 0
          ? (
            <div style="text-align: center; padding: 60px 20px; color: var(--color-text-light);">
              <div style="font-size: 48px; margin-bottom: 16px;">🧒</div>
              <p style="font-size: 18px; font-weight: 600;">
                No children added yet
              </p>
              <p style="margin-top: 8px; margin-bottom: 24px;">
                Add your first child to start tracking their points!
              </p>
              <AddChildForm />
            </div>
          )
          : (
            <div>
              {user.children.map((child) => (
                <ChildRow
                  key={child.id}
                  childId={child.id}
                  initialName={child.name}
                  initialPoints={child.points}
                  initialAvatarIcon={child.avatarIcon}
                  initialAvatarUrl={child.avatarUrl}
                />
              ))}

              {/* Add another child */}
              <div style="margin-top: 12px;">
                <AddChildForm />
              </div>
            </div>
          )}
      </div>
    </div>
  );
});
