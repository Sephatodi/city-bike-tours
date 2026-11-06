import { Navigate, createBrowserRouter } from "react-router";
import Root from "./Root";
import LandingPage from "./pages/LandingPage";
import SchedulePage from "./pages/SchedulePage";
import LoginPage from "./pages/LoginPage";
import LoginCallbackPage from "./pages/LoginCallbackPage";
import BookingPage from "./pages/BookingPage";
import GalleryPage from "./pages/GalleryPage";
import HeritageTrailPage from "./pages/HeritageTrailPage";
import RideTicketPage from "./pages/RideTicketPage";
import MessageInboxPage from "./pages/MessageInboxPage";
import LegalPage from "./pages/LegalPage";
import DashboardPage from "./pages/DashboardPage";
import SiteGalleryPage from "./pages/SiteGalleryPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

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
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "reset-password", Component: ResetPasswordPage },
      { path: "login/callback", Component: LoginCallbackPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "connect", element: <Navigate to="/" replace /> },
      { path: "book", Component: BookingPage },
      { path: "gallery", Component: GalleryPage },
      { path: "gallery/:siteId", Component: SiteGalleryPage },
      { path: "heritage-trail", Component: HeritageTrailPage },
      { path: "ticket/:token", Component: RideTicketPage },
      { path: "messages", Component: MessageInboxPage },
      { path: "privacy", element: <LegalPage page="privacy" /> },
      { path: "terms", element: <LegalPage page="terms" /> },
      { path: "data-deletion", element: <LegalPage page="data-deletion" /> },
    ],
  },
]);