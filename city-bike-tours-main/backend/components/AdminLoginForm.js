"use client";

import { useEffect, useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm({ notice = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("email"); // email | password | activation-code | activation-password | mfa | forgot-email | reset-password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [activationToken, setActivationToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState(searchParams.get("token") || "");
  const [resetMessage, setResetMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Landing on /admin/login?token=... means the user clicked a reset link.
  useEffect(() => {
    if (resetToken) setStep("reset-password");
  }, [resetToken]);

  function resetToEmail() {
    setStep("email");
    setPassword("");
    setMfaCode("");
    setActivationCode("");
    setActivationToken("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setResetMessage("");
    setError("");
    setShowPassword(false);
  }

  async function handleCheckEmail(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/admin-activation/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not check email.");
      if (data.state === "activation") setStep("activation-code");
      else if (data.state === "password") setStep("password");
      else throw new Error("No admin account found for this email, or the account is not available.");
    } catch (reason) {
      setError(reason.message || "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  }

  async function completeStaffSignIn() {
    const session = await getSession();
    if (!session?.user?.isStaff) {
      await signOut({ redirect: false });
      throw new Error("This account doesn't have dashboard access. Ask an admin to give you a role.");
    }
    router.replace("/admin");
    router.refresh();
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await signIn("credentials", { email, password, code: mfaCode, redirect: false, callbackUrl: "/admin" });
      if (result?.error === "ACTIVATION_REQUIRED") {
        setStep("activation-code");
        throw new Error("This account needs activation. Enter the 6-digit code shared by the admin who created your account.");
      }
      if (result?.error === "MFA_REQUIRED") {
        setStep("mfa");
        throw new Error("Enter the 6-digit code from your authenticator app.");
      }
      if (!result?.ok || result.error) throw new Error(step === "mfa" ? "That code didn't work. Try the newest one." : "Password is incorrect, or sign-in is temporarily locked after too many tries.");
      await completeStaffSignIn();
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
      setStep("activation-password");
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
      const result = await signIn("credentials", { email, password: newPassword, redirect: false, callbackUrl: "/admin" });
      if (!result?.ok || result.error) throw new Error("Password saved, but sign-in failed. Please sign in with your new password.");
      await completeStaffSignIn();
    } catch (reason) {
      setError(reason.message || "Unable to complete activation.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/admin/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't send a reset link.");
      setResetMessage(data.message || "If that email has an account, we've sent instructions.");
    } catch (reason) {
      setError(reason.message || "Unable to send a reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetSubmit(event) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 12) { setError("Use at least 12 characters."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/admin/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "This reset link is invalid or has expired.");
      setResetMessage(data.message);
      setStep("email");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (reason) {
      setError(reason.message || "We couldn't reset your password. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const titles = {
    email: "Sign in",
    password: "Enter your password",
    mfa: "Authenticator code",
    "activation-code": "Activate your account",
    "activation-password": "Create your password",
    "forgot-email": "Reset your password",
    "reset-password": "Choose a new password",
  };
  const descriptions = {
    email: "Enter your staff email (e.g. username@citybikes.com) to continue.",
    password: `Signing in as ${email}. Enter your password to access the dashboard.`,
    mfa: "Enter the 6-digit code from your authenticator app.",
    "activation-code": "First-time sign-in: enter the 6-digit activation code shared by the admin who created your account.",
    "activation-password": "Set a new password for your account (min 12 characters). You’ll use this same password to sign in, including if you later link Google.",
    "forgot-email": "Enter your staff email and we'll send a reset link.",
    "reset-password": "This link expires in 30 minutes and can only be used once.",
  };

  return (
    <main className="adm-login">
      <section className="adm-card adm-login-card">
        <div className="adm-brand" style={{ padding: 0 }}>
          <span className="adm-brand-mark"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM18.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM15 6h3l-3.5 8H8l3-8h4z" /></svg></span>
          <span>City Bike Tours<small>Control desk</small></span>
        </div>
        <h1>{titles[step]}</h1>
        <p>{descriptions[step]}</p>

        {step === "email" && (
          <form onSubmit={handleCheckEmail}>
            <label className="field" htmlFor="admin-email">Email
              <input id="admin-email" className="input" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="username@citybikes.com" />
            </label>
            {notice && !error && <div className="adm-alert warn" role="status" style={{ marginBottom: 0 }}>{notice}</div>}
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Checking…" : "Continue"}</button>
          </form>
        )}

        {step === "forgot-email" && (
          <form onSubmit={handleForgotSubmit}>
            <label className="field" htmlFor="admin-email-forgot">Email
              <input id="admin-email-forgot" className="input" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="username@citybikes.com" />
            </label>
            {resetMessage && <div className="adm-alert warn" role="status" style={{ marginBottom: 0 }}>{resetMessage}</div>}
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send reset link"}</button>
            <button className="btn" type="button" style={{ marginTop: 8 }} onClick={resetToEmail}>Back to sign in</button>
          </form>
        )}

        {step === "reset-password" && (
          <form onSubmit={handleResetSubmit}>
            <label className="field" htmlFor="reset-email">Email
              <input id="reset-email" className="input" type="email" value={email} readOnly />
            </label>
            <label className="field" htmlFor="new-password-admin">New password
              <input id="new-password-admin" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required autoFocus value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </label>
            <label className="field" htmlFor="confirm-password-admin">Confirm password
              <input id="confirm-password-admin" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show passwords
            </label>
            {resetMessage && <div className="adm-alert warn" role="status" style={{ marginBottom: 0 }}>{resetMessage}</div>}
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting || !resetToken}>{submitting ? "Saving…" : "Update password"}</button>
            <button className="btn" type="button" style={{ marginTop: 8 }} onClick={resetToEmail}>Back to sign in</button>
          </form>
        )}

        {(step === "password" || step === "mfa") && (
          <form onSubmit={handlePasswordSubmit}>
            <label className="field" htmlFor="admin-email-readonly">Email
              <input id="admin-email-readonly" className="input" type="email" value={email} readOnly />
            </label>
            <label className="field" htmlFor="admin-password">Password
              <div style={{ display: "flex", gap: 6 }}>
                <input id="admin-password" className="input" style={{ flex: 1 }} type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} autoFocus={step === "password"} />
                <button type="button" className="btn btn-sm" style={{ height: "100%", minWidth: 44 }} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {showPassword ? <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22" /> : <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />}
                  </svg>
                </button>
              </div>
            </label>
            {step === "mfa" && (
              <label className="field" htmlFor="admin-code">Authenticator code
                <input id="admin-code" className="input num" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} />
              </label>
            )}
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Checking…" : "Sign in"}</button>
            <button className="btn" type="button" style={{ marginTop: 8 }} onClick={() => setStep("forgot-email")}>Forgot password?</button>
            <button className="btn" type="button" style={{ marginTop: 8 }} onClick={resetToEmail}>Use a different email</button>
          </form>
        )}

        {step === "activation-code" && (
          <form onSubmit={handleActivationCode}>
            <label className="field" htmlFor="activation-email">Email
              <input id="activation-email" className="input" type="email" value={email} readOnly />
            </label>
            <label className="field" htmlFor="activation-code">6-digit activation code
              <input id="activation-code" className="input num" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus value={activationCode} onChange={(e) => setActivationCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" />
            </label>
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Checking…" : "Verify code"}</button>
            <button className="btn" type="button" style={{ marginTop: 8 }} onClick={resetToEmail}>Use a different email</button>
          </form>
        )}

        {step === "activation-password" && (
          <form onSubmit={handleSetPassword}>
            <label className="field" htmlFor="activation-email-done">Email
              <input id="activation-email-done" className="input" type="email" value={email} readOnly />
            </label>
            <label className="field" htmlFor="new-password">New password
              <input id="new-password" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required autoFocus value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </label>
            <label className="field" htmlFor="confirm-password">Confirm password
              <input id="confirm-password" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show passwords
            </label>
            {error && <div className="adm-alert bad" role="alert" style={{ marginBottom: 0 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save password & sign in"}</button>
            <button className="btn" type="button" style={{ marginTop: 8 }} onClick={resetToEmail}>Start over</button>
          </form>
        )}
      </section>
    </main>
  );
}
