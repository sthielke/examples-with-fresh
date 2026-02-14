import { useSignal } from "@preact/signals";

export default function LoginForm() {
  const email = useSignal("");
  const password = useSignal("");
  const error = useSignal("");
  const loading = useSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error.value = "";
    loading.value = true;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        error.value = data.error || "Login failed";
        loading.value = false;
        return;
      }

      // Redirect on success
      globalThis.location.href = data.redirect || "/home";
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

      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <input
          id="password"
          type="password"
          class="form-input"
          placeholder="Enter your password"
          value={password.value}
          onInput={(e) => password.value = (e.target as HTMLInputElement).value}
          required
        />
      </div>

      <button
        type="submit"
        class="btn btn-primary"
        disabled={loading.value}
      >
        {loading.value ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
