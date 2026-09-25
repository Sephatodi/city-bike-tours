import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import Nav from "./components/Nav";
import BikeCursor from "./components/BikeCursor";

export default function Root() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Nav />
      <BikeCursor />
      <div className="shine-wrap">
        <Outlet />
      </div>
    </>
  );
}
