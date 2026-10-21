import { staffForPage } from "@/lib/admin-page";
import Overview from "@/components/admin/Overview";

export const metadata = { title: "Overview — City Bike Tours" };

export default async function Page() {
  await staffForPage("dashboard:read");
  return <Overview />;
}
