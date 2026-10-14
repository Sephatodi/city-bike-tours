import { staffForPage } from "@/lib/admin-page";
import ContentPage from "@/components/admin/ContentPage";

export const metadata = { title: "Content — City Bike Tours" };

export default async function Page() {
  await staffForPage("content:read");
  return <ContentPage />;
}
