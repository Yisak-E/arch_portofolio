import { redirect } from "next/navigation";

// Old /admin URL → the owner dashboard.
export default function AdminPage() {
  redirect("/dashboard");
}
