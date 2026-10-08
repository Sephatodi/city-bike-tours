import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import Nav from "./components/Nav";
import BikeCursor from "./components/BikeCursor";
import { LiveDataProvider } from "./hooks/LiveDataContext";

export default function Root() {
  const { pathname } = useLocation();
  const isAdminArea = pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <LiveDataProvider>
      <>
        {!isAdminArea && <Nav />}
        {!isAdminArea && <BikeCursor />}
        {isAdminArea ? <Outlet /> : <div className="shine-wrap"><Outlet /></div>}
      </>
    </LiveDataProvider>
  );
}
