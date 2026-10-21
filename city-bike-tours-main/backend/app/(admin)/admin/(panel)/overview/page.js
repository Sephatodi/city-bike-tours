import { redirect } from "next/navigation";

// /admin/overview is a common address to try; the overview lives at /admin.
export default function Page() {
  redirect("/admin");
}
