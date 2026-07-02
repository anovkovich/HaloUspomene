import { loadPortalData } from "@/lib/portal";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validate slug format
    if (!slug || typeof slug !== "string" || slug.length === 0) {
      return Response.json(
        { error: "Invalid slug" },
        { status: 400 }
      );
    }

    const data = await loadPortalData(slug);

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching portal data:", error);
    return Response.json(
      { error: "Failed to fetch portal data" },
      { status: 500 }
    );
  }
}
