import { staffForPage } from "@/lib/admin-page";
import AdminShell from "@/components/admin/AdminShell";

export default async function PanelLayout({ children }) {
  // Pages check their own permission and the two-step rule. Allowing it here keeps /admin/security reachable for setup.
  const staff = await staffForPage(null, { allowWithoutMfa: true });
  return <AdminShell staff={staff}>{children}</AdminShell>;
}
