import { staffForPage } from "@/lib/admin-page";
import RoutesPage from "@/components/admin/RoutesPage";

export const metadata = { title: "Routes & prices — City Bike Tours" };

export default async function Page() {
  await staffForPage("routes:read");
  return <RoutesPage />;
}
