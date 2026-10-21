import { Sora } from "next/font/google";
import Providers from "@/components/Providers";
import "./admin.css";

const adminFont = Sora({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-admin" });

export const metadata = {
  title: "Dashboard — City Bike Tours",
  robots: { index: false, follow: false },
};

// A separate root layout: the admin never loads the public site's header, footer or global CSS.
export default function AdminRootLayout({ children }) {
  return (
    <html lang="en" className={adminFont.variable}>
      <body style={{ margin: 0, background: "#070a1f" }}>
        <Providers>
          <div className="adm">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
