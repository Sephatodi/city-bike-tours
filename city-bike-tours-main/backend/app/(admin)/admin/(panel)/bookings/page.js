import { staffForPage } from "@/lib/admin-page";
import Bookings from "@/components/admin/Bookings";

export const metadata = { title: "Bookings — City Bike Tours" };

export default async function Page() {
  await staffForPage("bookings:read");
  return <Bookings />;
}
