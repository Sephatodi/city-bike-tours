"use client";

import { useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm({ notice = "" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needCode, setNeedCode] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await signIn("credentials", { email, password, code, redirect: false, callbackUrl: "/admin" });
      if (result?.error === "MFA_REQUIRED") {
        setNeedCode(true);
        throw new Error("Enter the 6-digit code from your authenticator app.");
      }
      if (!result?.ok || result.error) throw new Error(needCode ? "That code didn't work. Try the newest one." : "Email or password is incorrect, or sign-in is temporarily locked after too many tries.");

      const session = await getSession();
      if (!session?.user?.isStaff) {
        await signOut({ redirect: false });
        throw new Error("This account doesn't have dashboard access. Ask an admin to give you a role.");
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
    <main className="adm-login">
      <section className="adm-card adm-login-card">
        <div className="adm-brand" style={{ padding: 0 }}>
          <span className="adm-brand-mark"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM18.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM15 6h3l-3.5 8H8l3-8h4z" /></svg></span>
          <span>City Bike Tours<small>Control desk</small></span>
        </div>
        <h1>Sign in</h1>
        <p>Use the staff account you were given to open the dashboard.</p>
        <form onSubmit={handleSubmit}>
          <label className="field" htmlFor="admin-email">Email
            <input id="admin-email" className="input" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field" htmlFor="admin-password">Password
            <div style={{ display: "flex", gap: 6 }}>
              <input id="admin-password" className="input" style={{ flex: 1 }} type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" className="btn btn-sm" style={{ height: "100%", minWidth: 44 }} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {showPassword ? (
                    <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22" />
                  ) : (
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  )}
                </svg>
              </button>
            </div>
          </label>
          {needCode && (
            <label className="field" htmlFor="admin-code">Authenticator code
              <input id="admin-code" className="input num" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus value={code} onChange={(event) => setCode(event.target.value)} />
            </label>
          )}
          {notice && !error && <div className="adm-alert warn" role="status" style={{ marginBottom: 0 }}>{notice}</div>}
          {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Checking…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
