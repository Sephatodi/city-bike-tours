// A cyclist riding to the right: round head, solid body, fenders and a chain ring.
// The cursor flips and tilts it so it always faces the way it is moving.
export default function RiderIcon({ size = 64, color = "#38BDF8" }) {
  return (
    <svg width={size} height={size * 0.77} viewBox="0 0 120 92" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round">
        {/* wheels, hubs and fenders */}
        <circle cx="26" cy="68" r="19" strokeWidth="5" />
        <circle cx="96" cy="68" r="19" strokeWidth="5" />
        <path d="M5 62 A23 23 0 0 1 36 47" strokeWidth="3" />
        <path d="M76 52 A23 23 0 0 1 112 58" strokeWidth="3" />
        <circle cx="26" cy="68" r="3.5" fill={color} strokeWidth="1" />
        <circle cx="96" cy="68" r="3.5" fill={color} strokeWidth="1" />
        {/* frame */}
        <path d="M26 68 L58 71" strokeWidth="4" />
        <path d="M26 68 L44 52" strokeWidth="4" />
        <path d="M44 52 L58 71" strokeWidth="4" />
        <path d="M44 52 L86 41" strokeWidth="4" />
        <path d="M86 41 L58 71" strokeWidth="4" />
        <path d="M86 41 L96 68" strokeWidth="4" />
        <path d="M86 41 L87 35" strokeWidth="4" />
        <circle cx="58" cy="71" r="7" strokeWidth="3" />
        {/* saddle */}
        <path d="M34 49 L50 49" strokeWidth="6" />
        {/* rider: body, arm, handlebar, leg, foot */}
        <path d="M52 25 L44 46" strokeWidth="16" />
        <path d="M56 28 L86 34" strokeWidth="6" />
        <path d="M84 34 Q93 31 94 40" strokeWidth="4" />
        <path d="M46 50 L68 54 L63 75" strokeWidth="9" />
        <path d="M60 77 L74 77" strokeWidth="5" />
      </g>
      <circle cx="60" cy="11" r="9.5" fill={color} />
    </svg>
  );
}
