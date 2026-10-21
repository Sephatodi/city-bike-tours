import { Suspense } from "react";
import BookCompleteClient from "@/components/BookCompleteClient";

export const metadata = { title: "Confirming your booking — Kgale Cycles" };

export default function BookCompletePage() {
  return (
    <Suspense fallback={null}>
      <BookCompleteClient />
    </Suspense>
  );
}
