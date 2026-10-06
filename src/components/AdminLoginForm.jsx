import { useState } from "react";
import { useNavigate } from "react-router";
import { signInAdmin, signOutAdmin } from "./adminAuth";

export default function AdminLoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await signInAdmin(email, password);
      if (!session?.user?.isAdmin) {
        await signOutAdmin();
        throw new Error("This account does not have administrator access.");
      }
      navigate("/admin", { replace: true });
    } catch (reason) {
      setError(reason.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-login-panel">
      <div className="section-eyebrow">Operations / Restricted</div>
      <h1>Administrator sign in</h1>
      <p>Use your provisioned staff account to open the tour control desk.</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="btn btn-primary auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking access..." : "Sign in to admin"}
        </button>
      </form>
    </section>
  );
}