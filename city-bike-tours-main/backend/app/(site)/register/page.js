import { redirect } from "next/navigation";
import { frontendUrl } from "@/lib/frontend-url";

export const dynamic = "force-dynamic";

// NextAuth sends people here when a social sign-in is cancelled or fails. Send them back to the website's login page.
export default function Register() {
  const login = frontendUrl("/login");
  if (login) redirect(login);
  return <p style={{ padding: "6rem 1.5rem", textAlign: "center" }}>Please sign in on the City Bike Tours website.</p>;
}
