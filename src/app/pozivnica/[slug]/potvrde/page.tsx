import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

// Preusmerenje ne zavisi od slug-a: portal sam prepoznaje par iz kolačića.
export default function PotvrdeRedirect() {
  redirect("/moje-vencanje?tab=guests");
}
