"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function BookCompleteClient() {
  const { data: session, status: sessionStatus } = useSession();
  const params = useSearchParams();
  const [state, setState] = useState("waiting"); // waiting | booking | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [booking, setBooking] = useState(null);

  const dateIso = params.get("dateIso");
  const bookingDate = params.get("date");
  const bookingTime = params.get("time");
  const bookingRoute = params.get("route");

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (sessionStatus === "unauthenticated") {
      setState("error");
      setErrorMsg("Sign-in didn't complete — go back to Book a Ride and try again.");
      return;
    }

    if (!dateIso) {
      setState("done"); // signed in with no booking to complete (e.g. just creating an account)
      return;
    }

    let cancelled = false;
    setState("booking");
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: params.get("category"),
        dateIso,
        timeSlot: params.get("slot"),
        routeId: params.get("routeId") || undefined,
        isKid: params.get("kid") === "yes",
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Couldn't complete the booking.");
        if (!cancelled) {
          setBooking(data.booking);
          setState("done");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMsg(err.message);
          setState("error");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, dateIso]);

  return (
    <div className="auth-shell">
      <div className="section-eyebrow">
        {state === "waiting" || state === "booking" ? "One moment" : state === "done" ? "You're in" : "Something went wrong"}
      </div>
      <h1 style={{ fontSize: 30, marginBottom: 24 }}>
        {state === "waiting" && "Finishing sign-in…"}
        {state === "booking" && "Confirming your booking…"}
        {state === "done" && (booking ? "Booking confirmed" : `Welcome, ${session?.user?.name ?? ""}`)}
        {state === "error" && "Couldn't finish that"}
      </h1>

      {state === "done" && booking && (
        <div className="booking-recap">
          <div className="head">Confirmed</div>
          <div>
            <strong>{bookingDate}</strong> — {bookingTime}
            {bookingRoute ? <> — {bookingRoute}</> : null}
            {booking.price != null ? <> — P{booking.price}</> : null}
          </div>
        </div>
      )}

      {state === "error" && <p style={{ color: "var(--dusk)", fontSize: 14, marginBottom: 20 }}>{errorMsg}</p>}

      {(state === "done" || state === "error") && (
        <a href="/book" className="btn btn-primary auth-submit" style={{ textAlign: "center" }}>
          {state === "error" ? "Back to booking" : "Book another ride"}
        </a>
      )}
    </div>
  );
}
