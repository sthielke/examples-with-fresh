import { useSignal } from "@preact/signals";

export default function OnboardForm() {
  const name = useSignal("");
  const email = useSignal("");
  const password = useSignal("");
  const confirmPassword = useSignal("");
  const error = useSignal("");
  const loading = useSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error.value = "";

    if (password.value !== confirmPassword.value) {
      error.value = "Passwords do not match";
      return;
    }

    if (password.value.length < 4) {
      error.value = "Password must be at least 4 characters";
      return;
    }

    loading.value = true;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          password: password.value,
        }),
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
          type="text"
          class="form-input"
          placeholder="your@email.com"
          value={email.value}
          onInput={(e) => email.value = (e.target as HTMLInputElement).value}
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <input
          id="password"
          type="password"
          class="form-input"
          placeholder="At least 4 characters"
          value={password.value}
          onInput={(e) => password.value = (e.target as HTMLInputElement).value}
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
