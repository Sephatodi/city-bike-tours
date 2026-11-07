import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import CookiesPopup from "./components/CookiesPopup";
import Nav from "./components/Nav";
import BikeCursor from "./components/BikeCursor";
import StationaryBicycle from "./components/StationaryBicycle";
import WhatsAppChat from "./components/WhatsAppChat";
import MobileBottomNav from "./components/MobileBottomNav";
import { LiveDataProvider } from "./hooks/LiveDataContext";
import { CustomerAuthProvider } from "./auth/CustomerAuth";

export default function Root() {
  const { pathname } = useLocation();
  const isAdminArea = pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <LiveDataProvider>
      <CustomerAuthProvider>
        {!isAdminArea && <CookiesPopup />}
        {!isAdminArea && <Nav />}
        {!isAdminArea && <BikeCursor />}
        {!isAdminArea && <StationaryBicycle />}
        {!isAdminArea && <WhatsAppChat />}
        {isAdminArea ? <Outlet /> : <div className="shine-wrap"><Outlet /></div>}
        {!isAdminArea && <MobileBottomNav />}
      </CustomerAuthProvider>
    </LiveDataProvider>
  );
}
