import { createBrowserRouter } from "react-router";
import Root from "./Root";
import LandingPage from "./pages/LandingPage";
import SchedulePage from "./pages/SchedulePage";
import RoutesPage from "./pages/RoutesPage";
import PricingPage from "./pages/PricingPage";
import BookingPage from "./pages/BookingPage";
import GalleryPage from "./pages/GalleryPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import RideTicketPage from "./pages/RideTicketPage";

import AdminDashboardLayout from "./components/AdminDashboardLayout";
import AdminOverview from "./components/AdminOverview";
import UserManagement from "./components/UserManagement";
import TeamsManagement from "./components/TeamsManagement";
import BookingRequests from "./components/BookingRequests";
import RouteManager from "./components/RouteManager";
import ContentManagement from "./components/ContentManagement";
import WebsiteSettings from "./components/WebsiteSettings";
import SEOManagement from "./components/SEOManagement";
import IntegrationsManagement from "./components/IntegrationsManagement";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import SystemLogs from "./components/SystemLogs";
import BackupManagement from "./components/BackupManagement";
import SecurityMaintenance from "./components/SecurityMaintenance";
import SoftwareUpdates from "./components/SoftwareUpdates";
import RideCheckin from "./components/RideCheckin";

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
      { path: "admin/login", Component: AdminLoginPage },
      {
        path: "admin",
        Component: AdminDashboardLayout,
        children: [
          { index: true, Component: AdminOverview },
          { path: "users", Component: UserManagement },
          { path: "teams", Component: TeamsManagement },
          { path: "bookings", Component: AdminOverview },
          { path: "routes", Component: RouteManager },
          { path: "requests", Component: BookingRequests },
          { path: "content", Component: ContentManagement },
          { path: "settings", Component: WebsiteSettings },
          { path: "seo", Component: SEOManagement },
          { path: "integrations", Component: IntegrationsManagement },
          { path: "analytics", Component: AnalyticsDashboard },
          { path: "logs", Component: SystemLogs },
          { path: "backups", Component: BackupManagement },
          { path: "security", Component: SecurityMaintenance },
          { path: "updates", Component: SoftwareUpdates },
          { path: "checkin", Component: RideCheckin },
        ],
      },
    ],
  },
]);