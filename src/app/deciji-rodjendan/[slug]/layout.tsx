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

  // Draft events now render a watermarked preview (B3) — the page handles it.

  return (
    <BirthdayPassedGuard eventDate={birthdayData.event_date}>
      {children}
    </BirthdayPassedGuard>
  );
}
