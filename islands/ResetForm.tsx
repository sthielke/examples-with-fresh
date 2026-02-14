import { useSignal } from "@preact/signals";

interface ResetFormProps {
  token: string;
}

export default function ResetForm({ token }: ResetFormProps) {
  const newPassword = useSignal("");
  const confirmPassword = useSignal("");
  const error = useSignal("");
  const success = useSignal("");
  const loading = useSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error.value = "";
    success.value = "";

    if (newPassword.value !== confirmPassword.value) {
      error.value = "Passwords do not match";
      return;
    }

    if (newPassword.value.length < 12) {
      error.value = "Password must be at least 12 characters";
      return;
    }

    loading.value = true;

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: newPassword.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        error.value = data.error || "Reset failed";
        loading.value = false;
        return;
      }

      success.value = data.message || "Password reset successfully!";
      loading.value = false;
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
      {success.value && (
        <div class="alert alert-success">
          {success.value}
          <div style="margin-top: 8px;">
            <a href="/" style="font-weight: 700;">
              Sign in with new password
            </a>
          </div>
        </div>
      )}

      <div class="form-group">
        <label class="form-label" for="newPassword">New Password</label>
        <input
          id="newPassword"
          type="password"
          class="form-input"
          placeholder="At least 12 characters"
          value={newPassword.value}
          onInput={(e) =>
            newPassword.value = (e.target as HTMLInputElement).value}
          required
          autoFocus
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="confirmPassword">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          class="form-input"
          placeholder="Re-enter new password"
          value={confirmPassword.value}
          onInput={(e) =>
            confirmPassword.value = (e.target as HTMLInputElement).value}
          required
        />
      </div>

      <button
        type="submit"
        class="btn btn-primary"
        disabled={loading.value}
      >
        {loading.value ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
