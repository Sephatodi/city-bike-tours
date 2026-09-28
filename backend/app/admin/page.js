import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/admin";
import AdminBookings from "@/components/AdminBookings";

export const metadata = { title: "Admin operations — City Bike Tours" };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");
  if (!hasAdminAccess(session)) redirect("/");
  return <AdminBookings />;
}