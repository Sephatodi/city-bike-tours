import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function ticketTokenFromScan(value) {
  try {
    const url = new URL(value);
    const match = url.pathname.match(/^\/ticket\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value) ? value : null;
  }
}

export default function BookingScanner() {
  const [scanKey, setScanKey] = useState(0);
  const [stage, setStage] = useState("starting");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let handledScan = false;
    let scanner;

    async function startScanner() {
      scanner = new Html5Qrcode("ride-pass-scanner");
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          async (decodedText) => {
            if (!isMounted || handledScan) return;
            handledScan = true;
            setStage("checking");
            setError("");
            const token = ticketTokenFromScan(decodedText);
            try {
              await scanner.stop();
              if (!token) throw new Error("This QR code is not a City Bike Tours ride pass.");
              const response = await fetch("/api/admin/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              });
              const result = await response.json().catch(() => ({}));
              if (!response.ok) throw new Error(result.error || "Could not check in this ride pass.");
              if (isMounted) {
                setTicket(result.ticket);
                setStage("checked-in");
              }
            } catch (reason) {
              if (isMounted) {
                setError(reason.message || "Could not check in this ride pass.");
                setStage("error");
              }
            }
          },
          () => {}
        );
        if (isMounted) setStage("scanning");
        else await scanner.stop().catch(() => {});
      } catch (reason) {
        if (isMounted) {
          setError(reason.message || "Camera access is unavailable.");
          setStage("error");
        }
      }
    }

    setTicket(null);
    setError("");
    setStage("starting");
    startScanner();

    return () => {
      isMounted = false;
      if (scanner) scanner.stop().catch(() => {}).finally(() => scanner.clear().catch(() => {}));
    };
  }, [scanKey]);

  return (
    <section className="admin-surface admin-checkin-view">
      <div className="admin-section-heading"><div><span className="admin-eyebrow">RIDE DAY</span><h2>Scan a rider pass</h2><p>Check in confirmed bookings for today’s Gaborone rides.</p></div></div>
      <div className="admin-checkin-layout">
        <div className="admin-scanner-frame"><div id="ride-pass-scanner" /></div>
        <div className="admin-checkin-result" aria-live="polite">
          {stage === "starting" && <p>Starting camera...</p>}
          {stage === "scanning" && <p>Camera ready. Hold the QR pass inside the frame.</p>}
          {stage === "checking" && <p>Checking pass...</p>}
          {stage === "error" && <p className="admin-checkin-error" role="alert">{error}</p>}
          {stage === "checked-in" && ticket && (
            <div className="admin-checkin-success">
              <span className="admin-checkin-success-mark">✓</span><span className="admin-eyebrow">CHECKED IN</span>
              <h3>{ticket.name}</h3><p>{ticket.routeName}</p><p>{ticket.rideDate} · {ticket.riders} rider{ticket.riders === 1 ? "" : "s"}</p>
              <strong>Ref {ticket.reference}</strong>
            </div>
          )}
          {(stage === "error" || stage === "checked-in") && <button type="button" className="admin-primary-button" onClick={() => setScanKey((key) => key + 1)}>Scan next pass</button>}
        </div>
      </div>
    </section>
  );
}