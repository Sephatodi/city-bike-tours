"use client";

import { api, useDash, useToast } from "./ui";
import { useState } from "react";

// One place for every action that changes a booking, so Overview and Bookings behave the same.
export function useBookingActions() {
  const { refresh } = useDash();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function wrap(fn) {
    setBusy(true);
    try { return await fn(); } catch (e) { toast(e.message || "Something went wrong.", "error"); return null; } finally { setBusy(false); }
  }

  const setStatus = (row, status, resend = false) => wrap(async () => {
    if (row.source === "account") {
      const result = await api(`/api/admin/bookings/${row.id}`, { method: "PATCH", body: { status } }, "Could not update the booking.");
      toast(status === "confirmed" ? "Booking confirmed." : "Booking cancelled.");
      await refresh();
      return result;
    }
    const result = await api(`/api/admin/booking-requests/${row.id}`, {
      method: "PATCH",
      body: { status, ...(resend ? { resendConfirmation: true } : {}) },
    }, "Could not update the booking request.");
    if (status === "confirmed" && result.notifications) {
      if (result.notifications.waLink) toast(resend ? "WhatsApp link ready. Click 'Send via WhatsApp' in the ride pass." : `Confirmed. ${row.name}'s ride pass is ready to send via WhatsApp.`);
      else if (!result.messagingConfigured) toast("Confirmed. Now send the ride pass with the WhatsApp button.");
      else toast("Confirmed, but the WhatsApp link couldn't be generated. Use the “Send via WhatsApp” button instead.", "error");
    } else {
      toast({ declined: "Request declined.", cancelled: "Booking cancelled.", confirmed: "Booking confirmed.", pending: "Moved back to pending." }[status] || "Updated.");
    }
    await refresh();
    return result;
  });

  const checkIn = (row) => wrap(async () => {
    const result = await api("/api/admin/check-in", { method: "POST", body: { id: row.id, type: row.source === "account" ? "booking" : "request" } }, "Could not check in.");
    toast(`${row.name} is checked in.`);
    await refresh();
    return result;
  });

  return { setStatus, checkIn, busy };
}

// Turns both booking sources into one list the screens can sort and filter.
export function unifyBookings(data) {
  const routeName = (id) => data.routesConfig.find((r) => r.routeId === id)?.routeName || (id === "lesson" ? "Cycling lesson" : id || "—");
  const requests = data.bookingRequests.map((r) => ({
    key: `r-${r.id}`, source: "request", id: r.id, name: r.name, phone: r.phone, email: null,
    route: routeName(r.routeId), date: r.rideDate, time: r.notes?.match(/Preferred start time:\s*(\d{2}:\d{2})/)?.[1] || null,
    riders: r.riders, status: r.status, notes: r.notes, checkedInAt: r.checkedInAt, createdAt: r.createdAt,
  }));
  const accounts = data.bookings.map((b) => ({
    key: `b-${b.id}`, source: "account", id: b.id, name: b.name, phone: b.phone, email: b.email,
    route: routeName(b.routeId || b.category), date: b.rideDate, time: b.timeSlot === "morning" ? "05:00" : "17:00",
    riders: 1, status: b.status, notes: b.isKid ? "Child ticket" : null, checkedInAt: b.checkedInAt, createdAt: null, price: b.price,
  }));
  return [...requests, ...accounts];
}
