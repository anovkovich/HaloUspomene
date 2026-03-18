import { redirect } from "next/navigation";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PotvrdeRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/pozivnica/${slug}/portal`);
}
