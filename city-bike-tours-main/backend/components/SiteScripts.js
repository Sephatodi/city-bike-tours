import Script from "next/script";
import { getSettings } from "@/lib/settings";

// Only IDs that match the expected shape are used, so a typo or bad value can never inject code.
export default async function SiteScripts() {
  const s = await getSettings();
  const ga = /^G-[A-Z0-9]{4,14}$/.test(s.gaId) ? s.gaId : null;
  const gtm = /^GTM-[A-Z0-9]{4,10}$/.test(s.gtmId) ? s.gtmId : null;
  const pixel = /^\d{6,20}$/.test(s.metaPixelId) ? s.metaPixelId : null;
  return (
    <>
      <Script src="/track.js" strategy="afterInteractive" />
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script>
        </>
      )}
      {gtm && <Script id="gtm-init" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>}
      {pixel && <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}</Script>}
    </>
  );
}
