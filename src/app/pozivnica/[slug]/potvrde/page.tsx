import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PotvrdeRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect("/moje-vencanje?tab=guests");
}
