export default function RiderIcon({ size = 64, responsive = false, color = "#38BDF8", className = "", style = {} }) {
  const s = responsive ? undefined : size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...(responsive ? { width: "100%", height: "100%" } : {}), ...style }}
      aria-hidden="true"
    >
      <circle cx="16" cy="44" r="10" stroke={color} strokeWidth="2.5" />
      <circle cx="48" cy="44" r="10" stroke={color} strokeWidth="2.5" />
      <circle cx="34" cy="14" r="5" fill={color} />
      <path d="M16 44l11-14 10 2 11 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 30l5 14 16 0" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 30l-5 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
