import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import Nav from "./components/Nav";

export default function Root() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Nav />
      <div className="shine-wrap">
        <Outlet />
      </div>
    </>
  );
}
