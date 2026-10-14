import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import SiteScripts from "@/components/SiteScripts";
import { getSettings } from "@/lib/settings";
import "./globals.css";

// Settings changes reach these pages within five minutes.
export const revalidate = 300;

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    keywords: s.seoKeywords,
    ...(s.noindexSite === "true" ? { robots: { index: false, follow: false } } : {}),
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <body>
        <Providers>
          <NavBar />
          {children}
          <Footer />
          <SiteScripts />
        </Providers>
      </body>
    </html>
  );
}
