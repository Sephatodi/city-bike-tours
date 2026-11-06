// TODO: replace the isSignedIn gate in GalleryPage UploadForm with this
// once the backend accepts a bookingCode on POST /api/community/photos.
export default function BookingCodePrompt({ value, onChange, onSubmit, status }) {
  return (
    <form onSubmit={onSubmit} className="auth-form" style={{ marginTop: "0.75rem" }}>
      <label>Booking code
        <input
          type="text"
          required
          maxLength={6}
          pattern="\d{4}[A-Z]{2}"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 6))}
          placeholder="e.g. 1234AB"
          inputMode="text"
          autoComplete="one-time-code"
        />
      </label>
      <button type="submit" className="auth-primary">Verify</button>
      {status && <p role="status" style={{ color: status.ok ? "#7fe3a8" : "#ffb4ab" }}>{status.message}</p>}
    </form>
  );
}
