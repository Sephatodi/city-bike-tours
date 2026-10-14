import { createBrowserRouter } from "react-router";
import Root from "./Root";
import LandingPage from "./pages/LandingPage";
import SchedulePage from "./pages/SchedulePage";
import RoutesPage from "./pages/RoutesPage";
import PricingPage from "./pages/PricingPage";
import BookingPage from "./pages/BookingPage";
import GalleryPage from "./pages/GalleryPage";
import RideTicketPage from "./pages/RideTicketPage";
import MessageInboxPage from "./pages/MessageInboxPage";

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
      { path: "gallery", Component: GalleryPage },
      { path: "ticket/:token", Component: RideTicketPage },
      { path: "messages", Component: MessageInboxPage },
    ],
  },
]);