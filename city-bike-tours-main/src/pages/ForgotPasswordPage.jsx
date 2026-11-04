import { useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import { backendUrl } from "../api/backend";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(backendUrl("/api/customer/password/forgot"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't process that request. Try again.");
      setMessage(result.message);
    } catch (cause) {
      setError(cause.message || "We couldn't process that request. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <main className="auth-shell">
        <section className="auth-card glass" aria-labelledby="forgot-heading">
          <p className="auth-kicker">— City Bike Tours community</p>
          <h1 className="font-display" id="forgot-heading">Forgot your password?</h1>
          <p className="auth-sub">Enter the email address on your rider account and we’ll send sign-in instructions if we find one.</p>
          <form onSubmit={submit} className="auth-form">
            <label>Email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            {message && <p className="auth-success" role="status">{message}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="auth-primary" disabled={busy}>{busy ? "Please wait…" : "Send instructions"}</button>
          </form>
          <Link className="auth-link" to="/login?mode=signin">Back to sign in</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
