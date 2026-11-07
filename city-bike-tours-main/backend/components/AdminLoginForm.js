"use client";

import { useEffect, useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm({ notice = "" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState(params?.get("activate") ? "activate" : "signin"); // signin | activate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(""); // MFA or activation code depending on step
  const [needMfa, setNeedMfa] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { if (params?.get("activate")) setMode("activate"); }, [params]);

  async function handleSignIn(event) {
    event.preventDefault();
    setError(""); setOk(""); setSubmitting(true);
    try {
      const result = await signIn("credentials", { email, password, code, redirect: false, callbackUrl: "/admin" });
      if (result?.error === "MFA_REQUIRED") { setNeedMfa(true); throw new Error("Enter the 6-digit code from your authenticator app."); }
      if (!result?.ok || result.error) throw new Error(needMfa ? "That code didn't work. Try the newest one." : "Email or password is incorrect, or sign-in is temporarily locked after too many tries.");
      const session = await getSession();
      if (!session?.user?.isStaff) { await signOut({ redirect: false }); throw new Error("This account doesn't have dashboard access. Ask an admin to give you a role."); }
      router.replace("/admin");
      router.refresh();
    } catch (reason) { setError(reason.message || "Unable to sign in."); }
    finally { setSubmitting(false); }
  }

  async function requestCode(event) {
    event.preventDefault();
    setError(""); setOk(""); setSubmitting(true);
    try {
      const res = await fetch("/api/admin/activate/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't send an activation code. Try again.");
      setSent(true);
      setOk(data.message || "If that staff account can be activated, we sent an activation code to its email.");
    } catch (reason) { setError(reason.message || "Couldn't send an activation code."); }
    finally { setSubmitting(false); }
  }

  async function completeActivation(event) {
    event.preventDefault();
    setError(""); setOk("");
    if (newPass !== confirmPass) { setError("Passwords do not match."); return; }
    if (newPass.length < 8) { setError("Use at least 8 characters for your password."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/activate/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code, password: newPass, confirmPassword: confirmPass }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Activation failed. Check your code and try again.");
      setOk(data.message || "Account activated. You can sign in now.");
      setMode("signin"); setPassword(""); setCode(""); setNeedMfa(false); setSent(false); setNewPass(""); setConfirmPass("");
    } catch (reason) { setError(reason.message || "Activation failed."); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="adm-login">
      <section className="adm-card adm-login-card">
        <div className="adm-brand" style={{ padding: 0 }}>
          <span className="adm-brand-mark"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM18.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM15 6h3l-3.5 8H8l3-8h4z" /></svg></span>
          <span>City Bike Tours<small>Control desk</small></span>
        </div>
        <h1>{mode === "signin" ? "Sign in" : "Activate your account"}</h1>
        <p>{mode === "signin" ? "Use the staff account you were given to open the dashboard." : "Enter your admin email and the activation code, then set a password."}</p>

        {mode === "signin" ? (
          <form onSubmit={handleSignIn}>
            <label className="field" htmlFor="admin-email">Email
              <input id="admin-email" className="input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="field" htmlFor="admin-password">Password
              <div style={{ display: "flex", gap: 6 }}>
                <input id="admin-password" className="input" style={{ flex: 1 }} type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="btn btn-sm" style={{ height: "100%", minWidth: 44 }} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {showPassword ? <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22" /> : <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />}
                  </svg>
                </button>
              </div>
            </label>
            {needMfa && (
              <label className="field" htmlFor="admin-code">Authenticator code
                <input id="admin-code" className="input num" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus value={code} onChange={(e) => setCode(e.target.value)} />
              </label>
            )}
            {notice && !error && !ok && <div className="adm-alert warn" role="status" style={{ marginBottom: 0 }}>{notice}</div>}
            {ok && <div className="adm-alert" role="status" style={{ marginBottom: 0, background: "rgba(62,207,142,.12)", color: "#c8f5df" }}>{ok}</div>}
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Checking…" : "Sign in"}</button>
            <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => { setMode("activate"); setError(""); setOk(""); }}>Activate account with a code</button>
          </form>
        ) : (
          <form onSubmit={sent ? completeActivation : requestCode}>
            <label className="field" htmlFor="act-email">Admin email
              <input id="act-email" className="input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {sent && <>
              <label className="field" htmlFor="act-code">Activation code (from email)
                <input id="act-code" className="input num" inputMode="numeric" autoComplete="one-time-code" required maxLength={12} value={code} onChange={(e) => setCode(e.target.value)} />
              </label>
              <label className="field" htmlFor="act-pass">New password
                <input id="act-pass" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              </label>
              <label className="field" htmlFor="act-confirm">Confirm password
                <input id="act-confirm" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show passwords
              </label>
            </>}
            {ok && <div className="adm-alert" role="status" style={{ marginBottom: 0, background: "rgba(62,207,142,.12)", color: "#c8f5df" }}>{ok}</div>}
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Working…" : (sent ? "Set password & activate" : "Send activation code")}</button>
            {sent && <button type="button" className="btn" style={{ marginTop: 8 }} onClick={requestCode} disabled={submitting}>Send a new code</button>}
            <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => { setMode("signin"); setSent(false); setError(""); setOk(""); setCode(""); setNewPass(""); setConfirmPass(""); }}>Back to sign in</button>
          </form>
        )}
      </section>
    </main>
  );
}
