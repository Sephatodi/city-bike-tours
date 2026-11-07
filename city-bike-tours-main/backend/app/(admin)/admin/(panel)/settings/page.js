import { staffForPage } from "@/lib/admin-page";
import SettingsPage from "@/components/admin/SettingsPage";

export const metadata = { title: "Settings — City Bike Tours" };

export default async function Page() {
  // Accessible to any active staff member; site settings mutations still require settings:write.
  await staffForPage("dashboard:read");
  return <SettingsPage />;
}
