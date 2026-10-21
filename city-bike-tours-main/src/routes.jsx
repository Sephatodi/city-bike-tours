import { Navigate, createBrowserRouter } from "react-router";
import Root from "./Root";
import LandingPage from "./pages/LandingPage";
import SchedulePage from "./pages/SchedulePage";
import LoginPage from "./pages/LoginPage";
import LoginCallbackPage from "./pages/LoginCallbackPage";
import ConnectPage from "./pages/ConnectPage";
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
      { path: "routes", element: <Navigate to="/book" replace /> },
      { path: "pricing", element: <Navigate to="/schedule#pricing" replace /> },
      { path: "login", Component: LoginPage },
      { path: "login/callback", Component: LoginCallbackPage },
      { path: "connect", Component: ConnectPage },
      { path: "book", Component: BookingPage },
      { path: "gallery", Component: GalleryPage },
      { path: "ticket/:token", Component: RideTicketPage },
      { path: "messages", Component: MessageInboxPage },
    ],
  },
]);