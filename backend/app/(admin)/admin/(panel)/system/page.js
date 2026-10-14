import { staffForPage } from "@/lib/admin-page";
import SystemPage from "@/components/admin/SystemPage";

export const metadata = { title: "System & backups — City Bike Tours" };

export default async function Page() {
  await staffForPage("system:read");
  return <SystemPage />;
}
