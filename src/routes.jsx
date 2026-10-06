import { createBrowserRouter } from "react-router";
import Root from "./Root";
import LandingPage from "./pages/LandingPage";
import SchedulePage from "./pages/SchedulePage";
import RoutesPage from "./pages/RoutesPage";
import PricingPage from "./pages/PricingPage";
import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import RideTicketPage from "./pages/RideTicketPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "schedule", Component: SchedulePage },
      { path: "routes", Component: RoutesPage },
      { path: "pricing", Component: PricingPage },
      { path: "book", Component: BookingPage },
      { path: "admin", Component: AdminPage },
      { path: "admin/login", Component: AdminLoginPage },
      { path: "ticket/:token", Component: RideTicketPage },
    ],
  },
]);
