import { useState, useEffect } from "react";

export default function RideCheckin() {
  const [scannerReady, setScannerReady] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [scanning, setScanning] = useState(false);

  // This would integrate with the existing BookingScanner component
  // For now, we'll show a placeholder that matches the admin dashboard style

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">RIDE OPERATIONS</span>
          <h1>Ride Check-in</h1>
          <p>Scan confirmed rider passes on ride day</p>
        </div>
      </header>

      <section className="admin-surface admin-checkin-view">
        <div className="admin-checkin-layout">
          <div className="admin-scanner-frame">
            <h3>QR Code Scanner</h3>
            <div id="ride-pass-scanner" style={{ width: "100%", maxWidth: "540px", margin: "0 auto" }}>
              <div style={{ 
                width: "100%", 
                aspectRatio: "4/3", 
                background: "#F1F3F8", 
                borderRadius: "8px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                border: "2px dashed #DDE2E9"
              }}>
                <div style={{ textAlign: "center", color: "#707D89" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📷</div>
                  <p>Camera scanner would be embedded here</p>
                  <p style={{ fontSize: "0.875rem" }}>Integrate with existing BookingScanner component</p>
                </div>
              </div>
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                <button className="admin-primary-button" onClick={() => setScanning(!scanning)}>
                  {scanning ? "Stop Scanning" : "Start Scanner"}
                </button>
                <button className="admin-secondary-button" onClick={() => { setLastScan(null); setScanError(null); }}>
                  Clear Result
                </button>
              </div>
            </div>
          </div>

          <div className="admin-checkin-result">
            {scanError && (
              <div className="admin-checkin-error">
                <strong>Check-in Failed</strong>
                <p>{scanError}</p>
              </div>
            )}
            {lastScan && !scanError && (
              <div className="admin-checkin-success">
                <div className="admin-checkin-success-mark">✓</div>
                <h3>Check-in Successful</h3>
                <p><strong>Rider:</strong> {lastScan.riderName}</p>
                <p><strong>Route:</strong> {lastScan.routeName}</p>
                <p><strong>Date:</strong> {lastScan.rideDate}</p>
                <p><strong>Time:</strong> {lastScan.timeSlot}</p>
                <strong>Checked in at {new Date().toLocaleTimeString()}</strong>
              </div>
            )}
            {!lastScan && !scanError && (
              <div style={{ color: "#707D89", textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎫</div>
                <p>Scan a ride pass to check in a rider</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}