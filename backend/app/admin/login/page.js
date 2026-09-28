import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AdminLoginForm from "@/components/AdminLoginForm";
import { authOptions } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/admin";

export const metadata = { title: "Admin sign in — City Bike Tours" };

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (hasAdminAccess(session)) redirect("/admin");

  return <main className="admin-shell"><div className="wrap"><AdminLoginForm /></div></main>;
}