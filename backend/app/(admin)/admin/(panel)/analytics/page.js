import { staffForPage } from "@/lib/admin-page";
import Analytics from "@/components/admin/Analytics";

export const metadata = { title: "Website traffic — City Bike Tours" };

export default async function Page() {
  await staffForPage("analytics:read");
  return <Analytics />;
}
