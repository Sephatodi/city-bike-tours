"use client";

import { useEffect, useState } from "react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load bookings.");
        setBookings(data.bookings);
      })
      .catch((reason) => setError(reason.message));
  }, []);

  return (
    <main className="admin-shell">
      <div className="wrap">
        <div className="section-eyebrow">Operations</div>
        <h1>Upcoming tour registrations</h1>
        <p className="lede admin-lede">Confirmed bookings from Neon, sorted by ride date.</p>
        {error ? <p className="admin-error">{error}</p> : (
          <div className="table-scroll admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Rider</th><th>Ride</th><th>Date</th><th>Time</th><th>Route</th><th>Contact</th></tr></thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.name}</strong><span>{booking.email}</span></td>
                    <td>{booking.category}</td>
                    <td>{booking.rideDate}</td>
                    <td>{booking.timeSlot}</td>
                    <td>{booking.routeId || "Lesson"}</td>
                    <td>{booking.phone || "No phone"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!bookings.length && <p className="admin-empty">No confirmed bookings yet.</p>}
          </div>
        )}
      </div>
    </main>
  );
}