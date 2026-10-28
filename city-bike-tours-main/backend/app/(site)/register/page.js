import { redirect } from "next/navigation";
import { frontendUrl } from "@/lib/frontend-url";

export const dynamic = "force-dynamic";

export default function RegisterRedirect() {
  const destination = frontendUrl("/login");
  if (!destination) {
    return <main style={{ padding: 32, fontFamily: "sans-serif" }}>City Bike Tours login is unavailable because the frontend URL is not configured. Set PUBLIC_FRONTEND_URL or FRONTEND_ORIGIN in the backend environment.</main>;
  }
  redirect(destination);
}
