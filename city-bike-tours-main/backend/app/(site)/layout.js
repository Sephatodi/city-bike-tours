import Providers from "@/components/Providers";

export const metadata = {
  title: "City Bike Tours",
  robots: { index: false, follow: false },
};

export default function SiteLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
