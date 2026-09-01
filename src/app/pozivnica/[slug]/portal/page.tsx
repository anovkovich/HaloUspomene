import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PortalPage({ params }: PageProps) {
  await params;
  redirect("/moje-vencanje?tab=guests");
}
