import { Suspense } from "react";
import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Sign up — Kgale Cycles" };

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
