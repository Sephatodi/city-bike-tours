import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { QRCodeSVG } from "qrcode.react";

export default function RideTicketPage() {
  const { token } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const ticketUrl = `${window.location.origin}/ticket/${token}`;

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/tickets/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "This ride pass is unavailable.");
        if (isMounted) setTicket(result.ticket);
      })
      .catch((reason) => {
        if (isMounted) setError(reason.message || "This ride pass is unavailable.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [token]);

  return (
    <main className="ride-ticket-page">
      <div className="ride-ticket-shell">
        <Link to="/" className="ride-ticket-brand"><span>CB</span> City Bike Tours</Link>
        <section className="ride-ticket-card">
          {loading ? <p className="ride-ticket-state">Loading your ride pass...</p> : error ? (
            <div className="ride-ticket-state" role="alert"><h1>Pass unavailable</h1><p>{error}</p><Link to="/schedule">View the ride schedule</Link></div>
          ) : ticket && (
            <>
              <div className="ride-ticket-header"><span className="ride-ticket-kicker">RIDE CONFIRMED</span><span className="ride-ticket-check">✓</span><h1>Your Gaborone ride</h1><p>Show this pass to your guide when you arrive.</p></div>
              <div className="ride-ticket-qr"><QRCodeSVG value={ticketUrl} size={232} level="M" marginSize={3} /></div>
              <div className="ride-ticket-details">
                <div><span>Rider</span><strong>{ticket.name}</strong></div>
                <div><span>Route</span><strong>{ticket.routeName}</strong></div>
                <div><span>Ride date</span><strong>{ticket.rideDate}</strong></div>
                <div><span>Group size</span><strong>{ticket.riders} rider{ticket.riders === 1 ? "" : "s"}</strong></div>
              </div>
              <div className="ride-ticket-reference">PASS REF <strong>{ticket.reference}</strong></div>
              <div className="ride-ticket-meetup"><strong>Main Mall, Gaborone</strong><span>Meet your guide at the City Bike Tours flag.</span></div>
              <button type="button" className="ride-ticket-print" onClick={() => window.print()}>Print ride pass</button>
            </>
          )}
        </section>
        <p className="ride-ticket-footer">City Bike Tours · Gaborone, Botswana</p>
      </div>
    </main>
  );
}