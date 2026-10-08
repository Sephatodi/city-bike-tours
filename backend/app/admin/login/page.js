import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { authOptions } from "@/lib/auth";

export const metadata = { title: "Administrator sign in — City Bike Tours" };

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.isAdmin) redirect("/admin");
  return <AdminLoginForm />;
}
