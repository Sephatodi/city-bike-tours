import { staffForPage } from "@/lib/admin-page";
import SettingsPage from "@/components/admin/SettingsPage";

export const metadata = { title: "Site settings — City Bike Tours" };

export default async function Page() {
  await staffForPage("settings:read");
  return <SettingsPage />;
}
