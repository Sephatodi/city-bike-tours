import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { authOptions } from "@/lib/auth";

export const metadata = { title: "Admin dashboard — City Bike Tours" };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/admin/login");
  return <AdminDashboard name={session.user.name || session.user.email} />;
}
