import { staffForPage } from "@/lib/admin-page";
import Inbox from "@/components/admin/Inbox";

export const metadata = { title: "Inbox & reviews — City Bike Tours" };

export default async function Page() {
  await staffForPage("inbox:read");
  return <Inbox />;
}
