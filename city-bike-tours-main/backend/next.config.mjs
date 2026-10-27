/** @type {import('next').NextConfig} */
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "https://city-bike-tours.vercel.app,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsHeaders = [
  { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Vary", value: "Origin" },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
      {
        // Browser requests from the Vite website need CORS headers on API responses,
        // including errors. Use the exact allowed origin rather than a wildcard because
        // customer authentication may use credentials.
        source: "/api/:path*",
        headers: [
          ...corsHeaders,
          ...allowedOrigins.map((origin) => ({
            key: "Access-Control-Allow-Origin",
            value: origin,
          })).slice(0, 1),
        ],
      },
      {
        source: "/:path*",
        headers: [],
      },
      {
        // The dashboard must never be shown inside another site's frame.
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
