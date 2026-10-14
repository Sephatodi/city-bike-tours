import { staffForPage } from "@/lib/admin-page";
import CheckIn from "@/components/admin/CheckIn";

export const metadata = { title: "Check-in — City Bike Tours" };

export default async function Page() {
  await staffForPage("checkin:write");
  return <CheckIn />;
}
