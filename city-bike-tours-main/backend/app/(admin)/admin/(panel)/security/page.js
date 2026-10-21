import { staffForPage } from "@/lib/admin-page";
import SecurityPage from "@/components/admin/SecurityPage";

export const metadata = { title: "Security — City Bike Tours" };

export default async function Page() {
  // Reachable without two-step sign-in so people can set it up when the team requires it.
  await staffForPage(null, { allowWithoutMfa: true });
  return <SecurityPage />;
}
