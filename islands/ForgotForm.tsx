import { useSignal } from "@preact/signals";

export default function ForgotForm() {
  const email = useSignal("");
  const error = useSignal("");
  const success = useSignal("");
  const resetUrl = useSignal("");
  const loading = useSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error.value = "";
    success.value = "";
    resetUrl.value = "";
    loading.value = true;

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value }),
      });

      const data = await res.json();

      if (!res.ok) {
        error.value = data.error || "Request failed";
        loading.value = false;
        return;
      }

      success.value = data.message ||
        "A password reset link has been sent to your email.";

      // In local dev, the API returns the reset URL directly
      if (data._dev_resetUrl) {
        resetUrl.value = data._dev_resetUrl;
      }

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
          {resetUrl.value && (
            <div
              style="margin-top: 12px; padding: 10px; background: #F0EDFF; border-radius: 8px; font-size: 13px;"
            >
              <div
                style="font-weight: 800; color: var(--color-primary); margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;"
              >
                Dev Mode — Reset Link:
              </div>
              <a
                href={resetUrl.value}
                style="word-break: break-all; font-weight: 700;"
              >
                {resetUrl.value}
              </a>
            </div>
          )}
        </div>
      )}

      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <input
          id="email"
          type="text"
          class="form-input"
          placeholder="Enter your email"
          value={email.value}
          onInput={(e) => email.value = (e.target as HTMLInputElement).value}
          required
          autoFocus
        />
      </div>

      <button
        type="submit"
        class="btn btn-primary"
        disabled={loading.value}
      >
        {loading.value ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
