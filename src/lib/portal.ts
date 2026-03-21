import clientPromise from "./mongodb";
import type { PortalData, ChecklistItem, PortalBudget } from "@/app/moje-vencanje/types";
import { getDefaultChecklist, getDefaultBudgetCategories } from "@/app/moje-vencanje/defaults";

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<PortalData>("wedding_portal");
}

export async function loadPortalData(slug: string): Promise<PortalData> {
  const c = await col();
  const now = new Date();
  const doc = await c.findOneAndUpdate(
    { slug },
    {
      $setOnInsert: {
        slug,
        checklist: getDefaultChecklist(),
        budget: { totalBudget: 0, categories: getDefaultBudgetCategories() },
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  return doc!;
}

export async function saveChecklist(
  slug: string,
  checklist: ChecklistItem[]
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { checklist, updatedAt: new Date() } }
  );
}

export async function saveBudget(
  slug: string,
  budget: PortalBudget
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { slug },
    { $set: { budget, updatedAt: new Date() } }
  );
}

export async function deletePortalData(slug: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ slug });
}
