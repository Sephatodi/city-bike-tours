import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminBookings from "@/components/AdminBookings";

export const metadata = { title: "Admin bookings — Kgale Cycles" };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) redirect("/");
  return <AdminBookings />;
}