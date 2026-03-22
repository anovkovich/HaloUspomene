import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { notFound } from "next/navigation";
import { getBirthdayData, getAllBirthdaySlugs } from "@/data/rodjendani";
import { getBirthdayRSVP } from "@/lib/birthday-rsvp";
import { getBirthdayThemeCSSVariables } from "../constants";
import BirthdayPortalClient from "./BirthdayPortalClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBirthdayData(slug);
  if (!data) return {};
  const title = `${data.child_name} - Portal`;
  const description = `Portal za rođendan - ${data.child_name}`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBirthdaySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BirthdayPortalPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBirthdayData(slug);

  if (!data) notFound();

  let responses: import("@/lib/birthday-rsvp").BirthdayRSVPEntry[] = [];
  let fetchError = false;

  try {
    responses = await getBirthdayRSVP(slug);
  } catch {
    fetchError = true;
  }

  const cssVars = getBirthdayThemeCSSVariables(data.theme, data.displayFont);

  const attending = responses.filter((r) => r.attending === "Da");
  const notAttending = responses.filter((r) => r.attending === "Ne");
  const totalGuests = attending.reduce(
    (sum, r) => sum + (parseInt(r.guestCount) || 1),
    0,
  );

  return (
    <div
      className="min-h-screen"
      style={{ ...cssVars as React.CSSProperties, backgroundColor: "var(--theme-background)" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{
              color: "var(--theme-primary)",
              fontFamily: "var(--theme-display-font)",
            }}
          >
            {data.child_name}
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--theme-text-light)" }}
          >
            Portal za upravljanje prijavama
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div
            className="p-4 rounded-2xl text-center"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--theme-primary)", fontFamily: "var(--theme-display-font)" }}
            >
              {totalGuests}
            </p>
            <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
              Gostiju dolazi
            </p>
          </div>
          <div
            className="p-4 rounded-2xl text-center"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--theme-primary)", fontFamily: "var(--theme-display-font)" }}
            >
              {attending.length}
            </p>
            <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
              Potvrdili Da
            </p>
          </div>
          <div
            className="p-4 rounded-2xl text-center"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--theme-text-muted)", fontFamily: "var(--theme-display-font)" }}
            >
              {notAttending.length}
            </p>
            <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
              Ne dolazi
            </p>
          </div>
        </div>

        {fetchError && (
          <div
            className="p-4 rounded-2xl text-center mb-6"
            style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
          >
            <p className="text-red-600 text-sm">
              Greška pri učitavanju prijava. Osvežite stranicu.
            </p>
          </div>
        )}

        <BirthdayPortalClient
          responses={responses}
          slug={slug}
          childName={data.child_name}
        />
      </div>
    </div>
  );
}
