import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import PasswordInput from "../components/PasswordInput";
import Footer from "../components/Footer";
import { backendUrl } from "../api/backend";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const token = params.get("token") || "";

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(backendUrl("/api/customer/password/reset"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "This reset link is invalid or has expired.");
      setMessage(result.message);
    } catch (cause) {
      setError(cause.message || "We couldn't reset your password. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <main className="auth-shell">
        <section className="auth-card glass" aria-labelledby="reset-heading">
          <p className="auth-kicker">— City Bike Tours community</p>
          <h1 className="font-display" id="reset-heading">Choose a new password</h1>
          <p className="auth-sub">Use at least 8 characters. This reset link can only be used once.</p>
          <form onSubmit={submit} className="auth-form">
            <label>New password<PasswordInput required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
            {message && <p className="auth-success" role="status">{message}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="auth-primary" disabled={busy || !token}>{busy ? "Please wait…" : "Update password"}</button>
          </form>
          <Link className="auth-link" to="/login?mode=signin">Back to sign in</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
