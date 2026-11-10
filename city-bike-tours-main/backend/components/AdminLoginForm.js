"use client";

import { useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm({ notice = "" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needCode, setNeedCode] = useState(false); // MFA
  const [activationStep, setActivationStep] = useState(null); // null | 'code' | 'password'
  const [activationToken, setActivationToken] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await signIn("credentials", { email, password, code, redirect: false, callbackUrl: "/admin" });
      if (result?.error === "ACTIVATION_REQUIRED") {
        setActivationStep("code");
        throw new Error("First-time login: enter the 6-digit activation code provided by the admin who created your account.");
      }
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

  async function handleActivationCode(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/admin-activation/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: activationCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "That code isn't right.");
      setActivationToken(data.activationToken);
      setActivationStep("password");
    } catch (reason) {
      setError(reason.message || "Unable to verify code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetPassword(event) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 12) { setError("Use at least 12 characters."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/admin-activation/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activationToken, password: newPassword, confirm: confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not set password.");
      // Sign in with the new password
      const result = await signIn("credentials", { email, password: newPassword, redirect: false, callbackUrl: "/admin" });
      if (!result?.ok || result.error) throw new Error("Password saved, but sign-in failed. Please sign in with your new password.");
      const session = await getSession();
      if (!session?.user?.isStaff) {
        await signOut({ redirect: false });
        throw new Error("This account doesn't have dashboard access.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (reason) {
      setError(reason.message || "Unable to complete activation.");
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
        <h1>{activationStep === "password" ? "Create your password" : activationStep === "code" ? "Activate your account" : "Sign in"}</h1>
        <p>
          {activationStep === "password"
            ? "Set a new password for your account. Use the same password you’ll use to sign in (including if you later link Google)."
            : activationStep === "code"
              ? "Enter the 6-digit activation code shared with you by the admin who created your account."
              : "Use your staff account (e.g. username@citybikes.com) to open the dashboard."}
        </p>

        {activationStep === "code" ? (
          <form onSubmit={handleActivationCode}>
            <label className="field" htmlFor="activation-email">Email
              <input id="activation-email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="field" htmlFor="activation-code">6-digit activation code
              <input id="activation-code" className="input num" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus value={activationCode} onChange={(e) => setActivationCode(e.target.value.replace(/\D/g, ""))} />
            </label>
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Checking…" : "Verify code"}</button>
            <button className="btn" type="button" style={{ marginTop: 8 }} onClick={() => { setActivationStep(null); setError(""); setActivationCode(""); }}>Back to sign in</button>
          </form>
        ) : activationStep === "password" ? (
          <form onSubmit={handleSetPassword}>
            <label className="field" htmlFor="new-password">New password
              <input id="new-password" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </label>
            <label className="field" htmlFor="confirm-password">Confirm password
              <input id="confirm-password" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show passwords
            </label>
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save password & sign in"}</button>
          </form>
        ) : (
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
        )}
      </section>
    </main>
  );
}
