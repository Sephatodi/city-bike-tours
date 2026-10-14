import { staffForPage } from "@/lib/admin-page";
import IntegrationsPage from "@/components/admin/IntegrationsPage";

export const metadata = { title: "Integrations — City Bike Tours" };

export default async function Page() {
  await staffForPage("settings:read");
  return <IntegrationsPage />;
}
