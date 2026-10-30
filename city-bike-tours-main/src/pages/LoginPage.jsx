import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { BACKEND_BASE_URL, backendUrl } from "../api/backend";
import { rememberNext, takeNext, useCustomer } from "../auth/CustomerAuth";
import Footer from "../components/Footer";
import PasswordInput from "../components/PasswordInput";

const SOCIALS = [
  { id: "google", label: "Google" },
  { id: "facebook", label: "Facebook" },
  { id: "apple", label: "Apple" },
];

function SocialIcon({ id }) {
  if (id === "google") return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" /><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" /><path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" /><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" /></svg>
  );
  if (id === "facebook") return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" /></svg>
  );
  return (
    <svg viewBox="0 0 17 20" width="16" height="18" fill="currentColor" aria-hidden="true"><path d="M14.1 10.6c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.3 2C2.5 10 3.6 14 5 16.2c.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.5-1-2.5-3.2Z" /><path d="M11.9 4.3c.6-.7 1-1.7.9-2.7-.9.04-1.9.6-2.6 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.6-1.2Z" /></svg>
  );
}

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 1 1 7.04 3.87Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.08-.4-.12-.56.12-.17.25-.64.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" /></svg>;
}

// Where the backend lives, so the social buttons can leave this site and come back.
function backendOrigin() {
  if (BACKEND_BASE_URL) return BACKEND_BASE_URL;
  return import.meta.env.DEV ? "http://localhost:3000" : window.location.origin;
}

export default function LoginPage() {
  const { isSignedIn, ready, signIn } = useCustomer();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") && params.get("next").startsWith("/") && !params.get("next").startsWith("//") ? params.get("next") : "/dashboard";

  const [providers, setProviders] = useState(null);
  const [providerLoadError, setProviderLoadError] = useState(false);
  const [mode, setMode] = useState(params.get("mode") === "signin" ? "signin" : "create");
  const [method, setMethod] = useState("email"); // email | sms | whatsapp
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(backendUrl("/api/customer/providers"), { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load sign-in methods.");
        return response.json();
      })
      .then((result) => {
        if (!controller.signal.aborted) setProviders(result && typeof result === "object" ? result : {});
      })
      .catch(() => {
        if (!controller.signal.aborted) { setProviders({}); setProviderLoadError(true); }
      });
    return () => controller.abort();
  }, []);

  if (ready && isSignedIn) return <Navigate to="/dashboard" replace />;

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function post(path, body) {
    const response = await fetch(backendUrl(path), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || "Something went wrong. Please try again.");
    return result;
  }

  async function run(task) {
    setBusy(true); setError("");
    try { await task(); } catch (err) { setError(err.message || "Something went wrong."); } finally { setBusy(false); }
  }

  const finish = (result) => { signIn(result.token, result.user); try { window.sessionStorage.removeItem("cbt-after-login"); } catch { /* ignore */ } navigate("/dashboard", { replace: true }); };

  const submitEmail = (event) => {
    event.preventDefault();
    run(async () => {
      const result = mode === "create"
        ? await post("/api/customer/register", form)
        : await post("/api/customer/login", { email: form.email, password: form.password });
      finish(result);
    });
  };

  const sendCode = (event) => {
    event?.preventDefault();
    run(async () => {
      const result = await post("/api/customer/otp/request", { phone, channel: method });
      setCodeSent(true); setDevCode(result.devCode || ""); setCode("");
    });
  };

  const verifyCode = (event) => {
    event.preventDefault();
    run(async () => finish(await post("/api/customer/otp/verify", { phone, code, name: form.name || undefined })));
  };

  function goSocial(id) {
    if (!enabled(id) || busy) return;
    rememberNext(next);
    // Start OAuth through the dedicated customer-social page. It invokes
    // NextAuth's client signIn flow and then returns through the customer
    // token-exchange endpoint, avoiding the direct /api/auth/signin/:provider URL.
    const socialUrl = new URL("/customer-social", backendOrigin());
    socialUrl.searchParams.set("provider", id);
    socialUrl.searchParams.set("return", window.location.origin);
    window.location.assign(socialUrl.toString());
  }

  const phoneMethod = method === "sms" || method === "whatsapp";
  const enabled = (id) => Boolean(providers?.[id]);

  return (
    <>
      <main className="auth-shell">
        <div className="auth-card glass">
          <p className="auth-kicker">— City Bike Tours community</p>
          <h1 className="font-display">{mode === "create" ? "Join the ride" : "Welcome back"}</h1>
          <p className="auth-sub">Sign in to message our team, leave a review and share your photos and stories.</p>

          <div className="auth-tabs" role="tablist" aria-label="Account">
            {[["create", "Create account"], ["signin", "Sign in"]].map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={mode === id} className={mode === id ? "active" : ""} onClick={() => { setMode(id); setError(""); setCodeSent(false); }}>{label}</button>
            ))}
          </div>

          <div className="auth-socials">
            {SOCIALS.map(({ id, label }) => (
              <button key={id} type="button" className="auth-social" disabled={!providers || !enabled(id) || busy} onClick={() => goSocial(id)} title={enabled(id) ? undefined : `${label} sign-in isn't set up yet`}>
                <SocialIcon id={id} /> Continue with {label}{providers && !enabled(id) && <small>Not set up yet</small>}
              </button>
            ))}
            <button type="button" className={`auth-social ${method === "whatsapp" ? "selected" : ""}`} disabled={!providers || !providers.whatsapp || busy} onClick={() => { setMethod("whatsapp"); setCodeSent(false); setError(""); }}>
              <WhatsAppIcon /> Continue with WhatsApp{providers && !providers.whatsapp && <small>Not set up yet</small>}
            </button>
            <button type="button" className={`auth-social ${method === "sms" ? "selected" : ""}`} disabled={!providers || !providers.sms || busy} onClick={() => { setMethod("sms"); setCodeSent(false); setError(""); }}>
              <span aria-hidden="true">📱</span> Continue with phone number{providers && !providers.sms && <small>Not set up yet</small>}
            </button>
          </div>
          {providerLoadError && <p className="auth-error" role="status">We could not load sign-in providers. Check the backend connection and CORS settings, then reload this page.</p>}

          <div className="auth-divider"><span>{phoneMethod ? (method === "whatsapp" ? "WhatsApp number" : "Phone number") : "or use your email"}</span></div>

          {phoneMethod ? (
            <form onSubmit={codeSent ? verifyCode : sendCode} className="auth-form">
              {!codeSent && mode === "create" && (
                <label>Your name<input type="text" autoComplete="name" value={form.name} onChange={update("name")} placeholder="Your name" /></label>
              )}
              <label>{method === "whatsapp" ? "WhatsApp number" : "Phone number"}
                <input type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+267 7X XXX XXX" disabled={codeSent} />
              </label>
              {codeSent && (
                <label>6-digit code
                  <input type="text" inputMode="numeric" autoComplete="one-time-code" required pattern="\d{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" autoFocus />
                  <small>We sent a code to your {method === "whatsapp" ? "WhatsApp" : "phone"}. It expires in 10 minutes.</small>
                  {devCode && <small style={{ color: "#D4A017" }}>Local test mode — your code is {devCode}</small>}
                </label>
              )}
              {error && <p role="alert" className="auth-error">{error}</p>}
              <button type="submit" className="auth-primary" disabled={busy}>{busy ? "Please wait…" : codeSent ? "Verify and continue" : "Send me a code"}</button>
              {codeSent && <button type="button" className="auth-link" disabled={busy} onClick={sendCode}>Send a new code</button>}
              <button type="button" className="auth-link" onClick={() => { setMethod("email"); setCodeSent(false); setError(""); }}>Use email instead</button>
            </form>
          ) : (
            <form onSubmit={submitEmail} className="auth-form">
              {mode === "create" && <label>Full name<input type="text" required autoComplete="name" value={form.name} onChange={update("name")} placeholder="Your name" /></label>}
              <label>Email<input type="email" required autoComplete="email" value={form.email} onChange={update("email")} placeholder="you@example.com" /></label>
              {mode === "create" && <label>Phone / WhatsApp <span className="auth-optional">optional</span><input type="tel" autoComplete="tel" value={form.phone} onChange={update("phone")} placeholder="+267 7X XXX XXX" /></label>}
              <label>Password<PasswordInput required minLength={mode === "create" ? 8 : undefined} autoComplete={mode === "create" ? "new-password" : "current-password"} value={form.password} onChange={update("password")} placeholder={mode === "create" ? "At least 8 characters" : "Your password"} /></label>
              {error && <p role="alert" className="auth-error">{error}</p>}
              <button type="submit" className="auth-primary" disabled={busy}>{busy ? "Please wait…" : mode === "create" ? "Create my account" : "Sign in"}</button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
