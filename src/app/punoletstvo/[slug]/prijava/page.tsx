import { notFound } from "next/navigation";
import { getBirthdayData } from "@/lib/birthday";
import { getBirthdayThemeCSSVariables } from "@/app/deciji-rodjendan/[slug]/constants";
import PunoletstvoPrijavaClient from "./PunoletstvoPrijavaClient";
import type {
  BirthdayFontType,
} from "@/app/deciji-rodjendan/[slug]/types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function PunoletstvoPrijavaPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { next = `/punoletstvo/${slug}/portal` } = await searchParams;
  const data = await getBirthdayData(slug);

  if (!data || data.type !== "eighteenth") notFound();

  const displayFont = (data as { displayFont?: BirthdayFontType }).displayFont;
  const cssVars = getBirthdayThemeCSSVariables(data.theme, displayFont);

  const displayName =
    data.honoree_name && data.honoree_surname
      ? `${data.honoree_name} ${data.honoree_surname}`
      : data.child_name;

  return (
    <PunoletstvoPrijavaClient
      slug={slug}
      nextUrl={next}
      displayName={displayName}
      cssVars={cssVars}
      requiresPassword={!!data.admin_password}
    />
  );
}
