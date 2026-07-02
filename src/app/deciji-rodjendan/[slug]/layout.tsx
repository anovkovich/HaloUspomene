import { notFound } from "next/navigation";
import { getBirthdayData } from "@/data/rodjendani";
import BirthdayPassedGuard from "./BirthdayPassedGuard";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function BirthdaySlugLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const birthdayData = await getBirthdayData(slug);

  // Invalid slug → let the page handle the 404
  if (!birthdayData) return <>{children}</>;

  // Draft events only visible in dev
  if (birthdayData.draft && process.env.NODE_ENV === "production") notFound();

  return (
    <BirthdayPassedGuard eventDate={birthdayData.event_date}>
      {children}
    </BirthdayPassedGuard>
  );
}
