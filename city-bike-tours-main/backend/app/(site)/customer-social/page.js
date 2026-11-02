"use client";

import { Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { createAuthClient } from "@neondatabase/auth";
import { useSearchParams } from "next/navigation";

const PROVIDERS = ["google", "facebook", "apple"];

async function startGoogleWithNeon(back) {
  // Talks to Neon Auth through our own /api/neon-auth proxy so the session cookie stays on this site.
  const client = createAuthClient(`${window.location.origin}/api/neon-auth`);
  const { error } = await client.signIn.social({
    provider: "google",
    callbackURL: `/api/customer/neon/complete?return=${encodeURIComponent(back)}`,
    errorCallbackURL: `${back}/login/callback#error=signin_failed`,
  });
  if (error) window.location.href = `${back}/login/callback#error=signin_failed`;
}

function Start() {
  const params = useSearchParams();
  const provider = params.get("provider");
  const back = params.get("return") || "";

  useEffect(() => {
    if (!PROVIDERS.includes(provider)) return;
    if (provider !== "google") {
      signIn(provider, { callbackUrl: `/api/customer/social/complete?return=${encodeURIComponent(back)}` });
      return;
    }
    fetch("/api/customer/providers", { cache: "no-store" })
      .then((response) => response.json())
      .then((info) => {
        if (info.googleVia === "neon") return startGoogleWithNeon(back);
        return signIn("google", { callbackUrl: `/api/customer/social/complete?return=${encodeURIComponent(back)}` });
      })
      .catch(() => { window.location.href = `${back}/login/callback#error=signin_failed`; });
  }, [provider, back]);

  return <p style={{ padding: "6rem 1.5rem", textAlign: "center" }}>{PROVIDERS.includes(provider) ? "Taking you to sign in…" : "Unknown sign-in method."}</p>;
}

export default function CustomerSocialPage() {
  return <Suspense fallback={null}><Start /></Suspense>;
}
