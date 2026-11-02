import Providers from "@/components/Providers";

export const metadata = { title: "City Bike Tours", robots: { index: false, follow: false } };

// The backend only serves the API, the admin dashboard and the short hand-off page used by Google / Facebook sign-in.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", fontFamily: "system-ui, sans-serif", background: "#0f2a1c", color: "#F5EDD9" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
