import { Navigate, createBrowserRouter } from "react-router";
import Root from "./Root";
import LandingPage from "./pages/LandingPage";
import SchedulePage from "./pages/SchedulePage";
import LoginPage from "./pages/LoginPage";
import LoginCallbackPage from "./pages/LoginCallbackPage";
import ConnectPage from "./pages/ConnectPage";
import BookingPage from "./pages/BookingPage";
import GalleryPage from "./pages/GalleryPage";
import HeritageTrailPage from "./pages/HeritageTrailPage";
import RideTicketPage from "./pages/RideTicketPage";
import MessageInboxPage from "./pages/MessageInboxPage";
import DashboardPage from "./pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "schedule", Component: SchedulePage },
      { path: "routes", element: <Navigate to="/book" replace /> },
      { path: "pricing", element: <Navigate to="/schedule#pricing" replace /> },
      { path: "login", Component: LoginPage },
      { path: "login/callback", Component: LoginCallbackPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "connect", Component: ConnectPage },
      { path: "book", Component: BookingPage },
      { path: "gallery", Component: GalleryPage },
      { path: "heritage-trail", Component: HeritageTrailPage },
      { path: "ticket/:token", Component: RideTicketPage },
      { path: "messages", Component: MessageInboxPage },
    ],
  },
]);