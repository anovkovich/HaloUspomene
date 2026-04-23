import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBirthdayData, getAllBirthdaySlugs } from "@/lib/birthday";
import { getBirthdayRSVP } from "@/lib/birthday-rsvp";
import { getBirthdayThemeCSSVariables } from "../constants";
import BirthdayRasporedRoot from "./BirthdayRasporedRoot";
import type { RSVPEntry } from "@/lib/rsvp";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBirthdayData(slug);
  if (!data) return {};
  const honoree =
    data.type === "eighteenth"
      ? `${data.honoree_name ?? ""} ${data.honoree_surname ?? ""}`.trim() ||
        data.child_name
      : data.child_name;
  const title = `${honoree} — Raspored sedenja`;
  const description = `Raspored sedenja za proslavu — ${honoree}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BirthdayRasporedSedenja({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data) notFound();

  let responses: import("@/lib/birthday-rsvp").BirthdayRSVPEntry[] = [];
  try {
    responses = await getBirthdayRSVP(slug);
  } catch {
    // silently fail
  }

  // Birthday RSVP entries lack wedding's `details` + `category` fields;
  // map them onto the wedding shape so we can reuse the shared RasporedClient
  // (the GuestSidebar category filter hides itself when every guest has no
  // category — see GuestSidebar.tsx).
  const attending: RSVPEntry[] = responses
    .filter((r) => r.attending === "Da")
    .map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      name: r.name,
      attending: r.attending,
      guestCount: r.guestCount,
      details: r.message || "",
      category: "",
    }));

  const honoreeDisplay =
    data.type === "eighteenth"
      ? `${data.honoree_name ?? ""} ${data.honoree_surname ?? ""}`.trim() ||
        data.child_name
      : data.child_name;

  const cssVars = getBirthdayThemeCSSVariables(data.theme, data.displayFont);

  const editorVars: React.CSSProperties = {
    ...(cssVars as React.CSSProperties),
    "--theme-text-light": "rgba(35, 35, 35, 0.78)",
    "--theme-text-muted": "rgba(35, 35, 35, 0.92)",
    "--theme-border-light": "rgba(35, 35, 35, 0.2)",
    "--theme-border": "rgba(35, 35, 35, 0.32)",
  } as React.CSSProperties;

  return (
    <div style={editorVars}>
      <BirthdayRasporedRoot
        slug={slug}
        honoreeDisplay={honoreeDisplay}
        age={data.age}
        type={data.type ?? "child"}
        birthdayTheme={data.theme}
        paidForRaspored={data.paid_for_raspored ?? false}
        attending={attending}
      />
    </div>
  );
}
