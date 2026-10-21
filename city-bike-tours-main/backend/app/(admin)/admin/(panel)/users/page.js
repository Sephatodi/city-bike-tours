import { staffForPage } from "@/lib/admin-page";
import UsersPage from "@/components/admin/UsersPage";

export const metadata = { title: "Users & roles — City Bike Tours" };

export default async function Page() {
  await staffForPage("users:read");
  return <UsersPage />;
}
