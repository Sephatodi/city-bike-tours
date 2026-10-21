const SILHOUETTE_COLOR = "#231f40";

export default function UphillCyclist({ className = "", title = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      {title && <title>{title}</title>}
      <polygon points="0,800 800,430 800,800" fill={SILHOUETTE_COLOR} />

      <g transform="translate(420, 480) rotate(-24.5)">
        <circle cx="-130" cy="40" r="65" stroke={SILHOUETTE_COLOR} strokeWidth="10" fill="none" />
        <circle cx="-130" cy="40" r="8" fill={SILHOUETTE_COLOR} />
        <circle cx="130" cy="40" r="65" stroke={SILHOUETTE_COLOR} strokeWidth="10" fill="none" />
        <circle cx="130" cy="40" r="8" fill={SILHOUETTE_COLOR} />

        <line x1="-130" y1="40" x2="-20" y2="40" stroke={SILHOUETTE_COLOR} strokeWidth="10" strokeLinecap="round" />
        <line x1="-130" y1="40" x2="-50" y2="-50" stroke={SILHOUETTE_COLOR} strokeWidth="10" strokeLinecap="round" />
        <line x1="-20" y1="40" x2="-60" y2="-80" stroke={SILHOUETTE_COLOR} strokeWidth="12" strokeLinecap="round" />
        <line x1="-20" y1="40" x2="65" y2="-45" stroke={SILHOUETTE_COLOR} strokeWidth="12" strokeLinecap="round" />
        <line x1="-55" y1="-65" x2="60" y2="-45" stroke={SILHOUETTE_COLOR} strokeWidth="10" strokeLinecap="round" />
        <line x1="130" y1="40" x2="60" y2="-45" stroke={SILHOUETTE_COLOR} strokeWidth="10" strokeLinecap="round" />
        <line x1="60" y1="-45" x2="45" y2="-75" stroke={SILHOUETTE_COLOR} strokeWidth="10" strokeLinecap="round" />
        <line x1="30" y1="-75" x2="65" y2="-70" stroke={SILHOUETTE_COLOR} strokeWidth="12" strokeLinecap="round" />

        <circle cx="-20" cy="40" r="22" stroke={SILHOUETTE_COLOR} strokeWidth="6" fill="none" />
        <line x1="-20" y1="40" x2="-5" y2="15" stroke={SILHOUETTE_COLOR} strokeWidth="8" strokeLinecap="round" />
        <line x1="-20" y1="40" x2="-35" y2="65" stroke={SILHOUETTE_COLOR} strokeWidth="8" strokeLinecap="round" />
        <line x1="-13" y1="15" x2="3" y2="15" stroke={SILHOUETTE_COLOR} strokeWidth="6" strokeLinecap="round" />
        <line x1="-43" y1="65" x2="-27" y2="65" stroke={SILHOUETTE_COLOR} strokeWidth="6" strokeLinecap="round" />

        <line x1="-60" y1="-80" x2="-70" y2="-110" stroke={SILHOUETTE_COLOR} strokeWidth="8" />
        <path d="M-90,-110 C-90,-114 -80,-115 -50,-112 C-45,-111 -45,-106 -55,-106 L-85,-106 Z" fill={SILHOUETTE_COLOR} />

        <path d="M-52,-135 L-12,-90 L-25,-25" stroke={SILHOUETTE_COLOR} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M-55,-135 L-15,-270" stroke={SILHOUETTE_COLOR} strokeWidth="52" strokeLinecap="round" fill="none" />
        <path d="M-15,-255 L50,-215 L52,-75" stroke={SILHOUETTE_COLOR} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="-2" cy="-330" r="30" fill={SILHOUETTE_COLOR} />
      </g>
    </svg>
  );
}