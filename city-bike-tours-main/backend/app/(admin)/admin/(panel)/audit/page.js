import { staffForPage } from "@/lib/admin-page";
import AuditPage from "@/components/admin/AuditPage";

export const metadata = { title: "Audit log — City Bike Tours" };

export default async function Page() {
  await staffForPage("audit:read");
  return <AuditPage />;
}
