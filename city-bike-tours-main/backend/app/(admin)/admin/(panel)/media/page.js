import { staffForPage } from "@/lib/admin-page";
import Media from "@/components/admin/Media";

export const metadata = { title: "Media library — City Bike Tours" };

export default async function Page() {
  await staffForPage("media:read");
  return <Media />;
}
