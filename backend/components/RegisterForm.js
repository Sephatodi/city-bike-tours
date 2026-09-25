"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function GoogleIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 17 20" fill="currentColor" aria-hidden="true">
      <path d="M14.1 10.6c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.3 2C2.5 10 3.6 14 5 16.2c.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.5-1-2.5-3.2Z" />
      <path d="M11.9 4.3c.6-.7 1-1.7.9-2.7-.9.04-1.9.6-2.6 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.6-1.2Z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

async function completeBooking(params) {
  const dateIso = params.get("dateIso");
  if (!dateIso) return { skipped: true };

  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: params.get("category"),
      dateIso,
      timeSlot: params.get("slot"),
      routeId: params.get("routeId") || undefined,
      isKid: params.get("kid") === "yes",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Couldn't complete the booking.");
  return { skipped: false, booking: data.booking };
}

export default function RegisterForm() {
  const params = useSearchParams();
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const bookingCategory = params.get("category");
  const bookingDate = params.get("date");
  const bookingTime = params.get("time");
  const bookingRoute = params.get("route");
  const bookingPrice = params.get("price");
  const hasBooking = Boolean(bookingDate);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      if (mode === "create") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Couldn't create your account.");
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (!result || result.error) {
        throw new Error(mode === "create" ? "Account created, but sign-in failed — try signing in." : "Incorrect email or password.");
      }

      const outcome = await completeBooking(params);
      setConfirmedBooking(outcome.skipped ? null : outcome.booking);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
      setStatus("error");
    }
  }

  function handleSocial(provider) {
    signIn(provider, { callbackUrl: `/book/complete?${params.toString()}` });
  }

  if (status === "done") {
    return (
      <div className="auth-shell">
        <div className="section-eyebrow">You're in</div>
        <h1 style={{ fontSize: 30, marginBottom: 24 }}>
          {confirmedBooking ? "Booking confirmed" : "Account ready"}
        </h1>
        {confirmedBooking ? (
          <div className="booking-recap">
            <div className="head">Confirmed</div>
            <div>
              <strong>{bookingDate}</strong> — {bookingTime}
              {bookingRoute ? <> — {bookingRoute}</> : null}
              {confirmedBooking.price != null ? <> — P{confirmedBooking.price}</> : null}
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--ink-soft)" }}>Your account is set up. Head back to Book a Ride whenever you're ready.</p>
        )}
        <a href="/book" className="btn btn-primary auth-submit" style={{ textAlign: "center" }}>
          Book another ride
        </a>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="section-eyebrow">{hasBooking ? "One last step" : "Your account"}</div>
      <h1 style={{ fontSize: 30, marginBottom: 24 }}>{mode === "create" ? "Create your account" : "Sign in"}</h1>

      {hasBooking && (
        <div className="booking-recap">
          <div className="head">{bookingCategory ? `${bookingCategory} ride` : "Completing this booking"}</div>
          <div>
            <strong>{bookingDate}</strong>
            {bookingTime ? <> — {bookingTime}</> : null}
            {bookingRoute ? <> — {bookingRoute}</> : null}
            {bookingPrice ? <> — P{bookingPrice}</> : null}
          </div>
        </div>
      )}

      <div className="auth-toggle" role="tablist" aria-label="Register or sign in">
        <button type="button" role="tab" aria-selected={mode === "create"} className={mode === "create" ? "active" : ""} onClick={() => setMode("create")}>
          Create account
        </button>
        <button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>
          Sign in
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === "create" && (
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" autoComplete="name" required value={form.name} onChange={update("name")} />
          </div>
        )}
        {mode === "create" && (
          <div className="field">
            <label htmlFor="phone">Phone for booking updates</label>
            <input id="phone" type="tel" autoComplete="tel" placeholder="+267 7X XXX XXX" value={form.phone} onChange={update("phone")} />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "create" ? "new-password" : "current-password"}
            required
            minLength={8}
            value={form.password}
            onChange={update("password")}
          />
        </div>

        {status === "error" && (
          <p style={{ color: "var(--dusk)", fontSize: 13, marginBottom: 12 }}>{errorMsg}</p>
        )}

        <button type="submit" className="btn btn-primary auth-submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Please wait…" : mode === "create" ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="divider">or continue with</div>

      <div className="social-stack">
        <button type="button" className="social-btn" onClick={() => handleSocial("google")}>
          <GoogleIcon />
          Continue with Google
        </button>
        <button type="button" className="social-btn" onClick={() => handleSocial("apple")}>
          <AppleIcon />
          Continue with Apple
        </button>
        <button type="button" className="social-btn" onClick={() => handleSocial("facebook")}>
          <FacebookIcon />
          Continue with Facebook
        </button>
      </div>

      <p className="auth-fineprint">By continuing you agree to Kgale Cycles&rsquo; terms and privacy policy.</p>
    </div>
  );
}
