import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { authOptions } from "@/lib/auth";
import { sessionIsFresh } from "@/lib/security";

export const metadata = { title: "Sign in — City Bike Tours" };

export default async function AdminLoginPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  // An expired session must not bounce back to /admin, or the two pages would redirect to each other forever.
  if (session?.user?.isStaff && (await sessionIsFresh(session))) redirect("/admin");
  const notice = searchParams?.expired ? "Your session expired. Please sign in again." : searchParams?.blocked ? "Access from this address is blocked. Contact an admin." : "";
  return <AdminLoginForm notice={notice} />;
}
