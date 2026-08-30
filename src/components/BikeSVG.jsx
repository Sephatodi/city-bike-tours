export default function BikeSVG({ size = 80, color = "#D4A017" }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="52" r="18" stroke={color} strokeWidth="3" fill="none" className="wheel-anim" style={{ transformOrigin: "22px 52px" }} />
      <line x1="22" y1="34" x2="22" y2="52" stroke={color} strokeWidth="2" />
      <line x1="4" y1="52" x2="22" y2="52" stroke={color} strokeWidth="2" />
      <circle cx="98" cy="52" r="18" stroke={color} strokeWidth="3" fill="none" className="wheel-anim" style={{ transformOrigin: "98px 52px" }} />
      <line x1="98" y1="34" x2="98" y2="52" stroke={color} strokeWidth="2" />
      <line x1="80" y1="52" x2="98" y2="52" stroke={color} strokeWidth="2" />
      <line x1="22" y1="52" x2="55" y2="20" stroke={color} strokeWidth="3" />
      <line x1="55" y1="20" x2="78" y2="52" stroke={color} strokeWidth="3" />
      <line x1="55" y1="20" x2="98" y2="34" stroke={color} strokeWidth="3" />
      <line x1="22" y1="52" x2="78" y2="52" stroke={color} strokeWidth="2.5" />
      <line x1="55" y1="20" x2="48" y2="10" stroke={color} strokeWidth="2.5" />
      <line x1="42" y1="8" x2="56" y2="8" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="98" y1="34" x2="104" y2="24" stroke={color} strokeWidth="2.5" />
      <line x1="100" y1="22" x2="108" y2="22" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="6" r="5" fill={color} />
      <path d="M60 11 Q58 20 55 20 Q65 20 70 28 Q75 20 70 16 Q65 10 60 11Z" fill={color} />
    </svg>
  );
}
