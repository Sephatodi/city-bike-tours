"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Badge, Icon, PageTop, api, niceDate, niceTime, useDash, useToast } from "./ui";
import jsQR from "jsqr";

// The ride pass QR holds a link like https://site/ticket/<token>; staff can also paste either the link or the bare token.
function tokenFrom(text) {
  const value = String(text || "").trim();
  const match = value.match(/\/ticket\/([A-Za-z0-9_.-]+)/);
  return match ? match[1] : value;
}

export default function CheckIn() {
  const { data, refresh } = useDash();
  const toast = useToast();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState("camera"); // "camera" | "photo"
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastDecodeRef = useRef(0);
  const streamRef = useRef(null);

  async function submit(raw) {
    const token = tokenFrom(raw);
    if (!token) return;
    setBusy(true);
    try {
      const res = await api("/api/admin/check-in", { method: "POST", body: { token } }, "Could not check in.");
      setResult({ ok: true, ticket: res.ticket });
      setText("");
      refresh();
    } catch (e) {
      setResult({ ok: false, message: e.message });
    } finally {
      setBusy(false);
    }
  }

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
    } catch {
      toast("Couldn't open the camera. Allow camera access in your browser, or paste the pass link instead.", "error");
      setScanning(false);
    }
  }, [toast]);

  const hasBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;

  const tick = useCallback(async () => {
    if (!scanning || !videoRef.current || videoRef.current.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = Date.now();
    // Limit to ~8 fps (125ms per frame)
    if (now - lastDecodeRef.current < 125) {
      animationFrameRef.current = requestAnimationFrame(tick);
      return;
    }
    lastDecodeRef.current = now;

    try {
      let code = null;

      if (hasBarcodeDetector) {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const codes = await detector.detect(videoRef.current);
        if (codes[0]?.rawValue) {
          code = codes[0].rawValue;
        }
      } else {
        // Use jsQR via canvas
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!canvas) {
          animationFrameRef.current = requestAnimationFrame(tick);
          return;
        }
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const width = 640;
        const height = (video.videoHeight * width) / video.videoWidth;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const qrResult = jsQR(imageData.data, width, height);
        if (qrResult?.data) {
          code = qrResult.data;
        }
      }

      if (code) {
        stopCamera();
        submit(code);
        return;
      }
    } catch {
      // Keep scanning
    }
    animationFrameRef.current = requestAnimationFrame(tick);
  }, [scanning, hasBarcodeDetector, stopCamera, submit]);

  useEffect(() => {
    if (scanning) {
      startCamera();
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [scanning, scanMode, startCamera, stopCamera, tick]);

  const handlePhotoScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrResult = jsQR(imageData.data, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      if (qrResult?.data) {
        await submit(qrResult.data);
      } else {
        toast("No QR code found. Try a clearer photo.", "error");
      }
    } catch {
      toast("Could not read the image. Try a different file.", "error");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const today = data?.today;
  const expected = data ? [
    ...data.bookingRequests.filter((r) => r.status === "confirmed" && r.rideDate === today).map((r) => ({ key: r.id, name: r.name, riders: r.riders, done: r.checkedInAt })),
    ...data.bookings.filter((b) => b.status === "confirmed" && b.rideDate === today).map((b) => ({ key: b.id, name: b.name, riders: 1, done: b.checkedInAt })),
  ] : [];

  return (
    <>
      <PageTop title="Check-in">Scan a rider's ride pass at the meeting point. Each pass works once, on the day of the ride.</PageTop>
      <div className="adm-split-even">
        <div className="adm-card">
          <div className="adm-card-head"><h2>Scan or paste a pass</h2></div>
          {scanning ? (
            <>
              <div className="adm-scan"><video ref={videoRef} muted playsInline /></div>
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <button className="btn" style={{ marginTop: 12 }} onClick={stopCamera}>Stop camera</button>
            </>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-primary" onClick={() => { setResult(null); setScanMode("camera"); startCamera(); }}>
                  <Icon name="qr" size={16} /> Scan QR code
                </button>
                <label className="btn" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <Icon name="image" size={16} style={{ marginRight: 6 }} /> Scan from photo
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoScan} style={{ display: "none" }} />
                </label>
              </div>
              <label className="field">Pass link or code
                <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the link from the rider's QR code" />
                <span className="hint">Or scan with the camera above.</span>
              </label>
              <button className="btn" type="submit" onClick={(e) => { e.preventDefault(); submit(text); }} disabled={busy || !text.trim()}>
                {busy ? "Checking…" : "Check in"}
              </button>
            </div>
          )}
          {result && (
            <div className={`adm-result ${result.ok ? "ok" : "bad"}`} role="status" style={{ marginTop: 16 }}>
              {result.ok ? (
                <>
                  <b style={{ fontSize: 16 }}>{result.ticket.name} is checked in</b>
                  <div className="muted" style={{ marginTop: 4 }}>{result.ticket.routeName} · {result.ticket.riders} rider{result.ticket.riders === 1 ? "" : "s"} · {niceDate(result.ticket.rideDate)} · Ref {result.ticket.reference}</div>
                  <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { setResult(null); startCamera(); }}>
                    <Icon name="qr" size={14} /> Scan next rider
                  </button>
                </>
              ) : <b>{result.message}</b>}
            </div>
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><div><h2>Expected today</h2><div className="sub">{today ? niceDate(today, { weekday: "long", day: "numeric", month: "long" }) : ""}</div></div></div>
          {expected.length ? (
            <ul className="adm-list">
              {expected.map((x) => (
                <li key={x.key}>
                  <div className="line">
                    <span><span style={{ fontWeight: 600 }}>{x.name}</span> <span className="muted">· {x.riders} rider{x.riders === 1 ? "" : "s"}</span></span>
                    {x.done ? <Badge tone="good">In at {niceTime(x.done).split(", ").pop()}</Badge> : <Badge tone="warn">Not yet</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          ) : <div className="adm-empty"><b>No confirmed rides today</b>Passes only work on the day of the ride.</div>}
        </div>
      </div>
    </>
  );
}