import { staffForPage } from "@/lib/admin-page";
import SeoPage from "@/components/admin/SeoPage";

export const metadata = { title: "Search (SEO) — City Bike Tours" };

export default async function Page() {
  await staffForPage("seo:read");
  return <SeoPage />;
}
