import { redirect } from "next/navigation";
import { frontendUrl } from "@/lib/frontend-url";

export const dynamic = "force-dynamic";

export default function Home() {
  const site = frontendUrl("/");
  if (site) redirect(site);
  return <p style={{ padding: "6rem 1.5rem", textAlign: "center" }}>City Bike Tours</p>;
}
