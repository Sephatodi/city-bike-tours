import { staffForPage } from "@/lib/admin-page";
import MessagesPage from "@/components/admin/MessagesPage";

export const metadata = { title: "Messages — City Bike Tours" };

export default async function Page() {
  await staffForPage("messages:read");
  return <MessagesPage />;
}
