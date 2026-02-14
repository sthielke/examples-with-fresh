import { useSignal } from "@preact/signals";

interface OnboardFormProps {
  /** If present, this is an invite-based registration */
  inviteToken?: string;
  /** Pre-filled email from the invite */
  inviteEmail?: string;
}

export default function OnboardForm(props: OnboardFormProps) {
  const name = useSignal("");
  const email = useSignal(props.inviteEmail || "");
  const password = useSignal("");
  const confirmPassword = useSignal("");
  const error = useSignal("");
  const loading = useSignal(false);

  // Authorized user invite field (only for primary registration, not invite flow)
  const showAuthorizedField = useSignal(false);
  const authorizedEmail = useSignal("");

  const isInviteFlow = !!props.inviteToken;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error.value = "";

    if (password.value !== confirmPassword.value) {
      error.value = "Passwords do not match";
      return;
    }

    if (password.value.length < 12) {
      error.value = "Password must be at least 12 characters";
      return;
    }

    loading.value = true;

    try {
      const body: Record<string, string> = {
        name: name.value,
        email: email.value,
        password: password.value,
      };

      // If this is an invite flow, include the token
      if (props.inviteToken) {
        body.inviteToken = props.inviteToken;
      }

      // If adding an authorized user, include their email
      if (
        !isInviteFlow && showAuthorizedField.value &&
        authorizedEmail.value.trim()
      ) {
        body.authorizedEmail = authorizedEmail.value.trim();
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        error.value = data.error || "Registration failed";
        loading.value = false;
        return;
      }

      globalThis.location.href = data.redirect || "/welcome";
    } catch {
      error.value = "Something went wrong. Please try again.";
      loading.value = false;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error.value && (
        <div class="alert alert-error">{error.value}</div>
      )}

      <div class="form-group">
        <label class="form-label" for="name">Full Name</label>
        <input
          id="name"
          type="text"
          class="form-input"
          placeholder="Your name"
          value={name.value}
          onInput={(e) => name.value = (e.target as HTMLInputElement).value}
          required
          autoFocus
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <input
          id="email"
          type="email"
          class="form-input"
          placeholder="your@email.com"
          value={email.value}
          onInput={(e) => email.value = (e.target as HTMLInputElement).value}
          required
          disabled={isInviteFlow}
          style={isInviteFlow ? "opacity: 0.7; cursor: not-allowed;" : ""}
        />
        {isInviteFlow && (
          <p style="font-size: 12px; color: var(--color-text-light); margin-top: 4px;">
            Email is set by the invitation and cannot be changed.
          </p>
        )}
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <input
          id="password"
          type="password"
          class="form-input"
          placeholder="At least 12 characters"
          value={password.value}
          onInput={(e) =>
            password.value = (e.target as HTMLInputElement).value}
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="confirmPassword">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          class="form-input"
          placeholder="Re-enter your password"
          value={confirmPassword.value}
          onInput={(e) =>
            confirmPassword.value = (e.target as HTMLInputElement).value}
          required
        />
      </div>

      {/* Authorized user section -- only for primary registration */}
      {!isInviteFlow && (
        <div class="form-group" style="margin-top: 8px;">
          {!showAuthorizedField.value
            ? (
              <button
                type="button"
                class="add-authorized-btn"
                onClick={() => (showAuthorizedField.value = true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add an authorized user
              </button>
            )
            : (
              <div class="authorized-user-section">
                <div
                  style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;"
                >
                  <label class="form-label" style="margin-bottom: 0;">
                    Authorized User Email
                  </label>
                  <button
                    type="button"
                    style="background: none; border: none; color: var(--color-text-light); cursor: pointer; font-size: 13px; padding: 2px 6px;"
                    onClick={() => {
                      showAuthorizedField.value = false;
                      authorizedEmail.value = "";
                    }}
                    title="Remove"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <input
                  type="email"
                  class="form-input"
                  placeholder="partner@email.com"
                  value={authorizedEmail.value}
                  onInput={(e) =>
                    authorizedEmail.value =
                      (e.target as HTMLInputElement).value}
                />
                <p style="font-size: 12px; color: var(--color-text-light); margin-top: 4px;">
                  They'll receive an email invite to create their own account
                  and share admin access to your children's points.
                </p>
              </div>
            )}
        </div>
      )}

      <button
        type="submit"
        class="btn btn-primary"
        disabled={loading.value}
      >
        {loading.value ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
