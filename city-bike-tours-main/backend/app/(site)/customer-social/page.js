"use client";

import { Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const PROVIDERS = ["google", "facebook", "apple"];

function Start() {
  const params = useSearchParams();
  const provider = params.get("provider");
  const back = params.get("return") || "";

  useEffect(() => {
    if (!PROVIDERS.includes(provider)) return;
    signIn(provider, { callbackUrl: `/api/customer/social/complete?return=${encodeURIComponent(back)}` });
  }, [provider, back]);

  return <p style={{ padding: "6rem 1.5rem", textAlign: "center" }}>{PROVIDERS.includes(provider) ? "Taking you to sign in…" : "Unknown sign-in method."}</p>;
}

export default function CustomerSocialPage() {
  return <Suspense fallback={null}><Start /></Suspense>;
}
