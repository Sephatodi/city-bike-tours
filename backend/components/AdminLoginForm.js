"use client";

import { useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/admin" });
      if (!result?.ok || result.error) throw new Error("Email or password is incorrect.");

      const session = await getSession();
      if (!session?.user?.isAdmin) {
        await signOut({ redirect: false });
        throw new Error("This account does not have administrator access.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (reason) {
      setError(reason.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="wrap page-header">
      <section className="admin-login-panel" style={{ maxWidth: 520, margin: "48px auto" }}>
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
          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Checking access..." : "Sign in to admin"}
          </button>
        </form>
      </section>
    </main>
  );
}
