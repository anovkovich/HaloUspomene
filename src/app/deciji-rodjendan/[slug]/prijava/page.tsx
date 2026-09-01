import { notFound } from "next/navigation";
import { getBirthdayData } from "@/data/rodjendani";
import { getBirthdayThemeCSSVariables } from "../constants";
import BirthdayPrijavaClient from "./BirthdayPrijavaClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function BirthdayPrijavaPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { next = `/deciji-rodjendan/${slug}/portal` } = await searchParams;
  const data = await getBirthdayData(slug);

  if (!data) notFound();

  const cssVars = getBirthdayThemeCSSVariables(data.theme, data.displayFont);

  return (
    <BirthdayPrijavaClient
      slug={slug}
      nextUrl={next}
      childName={data.child_name}
      cssVars={cssVars}
      requiresPassword={!!data.admin_password}
    />
  );
}
