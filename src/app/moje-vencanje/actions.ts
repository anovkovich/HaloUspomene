"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getWeddingData } from "@/data/pozivnice";
import {
  loadPortalData as dbLoadPortal,
  saveChecklist as dbSaveChecklist,
  saveBudget as dbSaveBudget,
} from "@/lib/portal";
import type { ChecklistItem, PortalBudget } from "./types";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

async function getAuthSlug(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get("moje_vencanje_auth")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.slug as string) ?? null;
  } catch {
    return null;
  }
}

export async function verifyAuth(): Promise<{
  ok: boolean;
  slug?: string;
  bride?: string;
  groom?: string;
  eventDate?: string;
} | null> {
  const slug = await getAuthSlug();
  if (!slug) return null;

  const data = await getWeddingData(slug);
  if (!data) return null;

  return {
    ok: true,
    slug,
    bride: data.couple_names.bride,
    groom: data.couple_names.groom,
    eventDate: data.event_date,
  };
}

export async function loadPortalDataAction() {
  const slug = await getAuthSlug();
  if (!slug) return null;

  const data = await dbLoadPortal(slug);
  return {
    checklist: data.checklist,
    budget: data.budget,
  };
}

export async function saveChecklistAction(checklist: ChecklistItem[]) {
  const slug = await getAuthSlug();
  if (!slug) return { error: "Niste prijavljeni" };
  await dbSaveChecklist(slug, checklist);
  return { ok: true };
}

export async function saveBudgetAction(budget: PortalBudget) {
  const slug = await getAuthSlug();
  if (!slug) return { error: "Niste prijavljeni" };
  await dbSaveBudget(slug, budget);
  return { ok: true };
}
