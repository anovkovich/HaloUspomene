import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

export interface RSVPEntry {
  id: string;
  timestamp: string;
  name: string;
  attending: string;
  guestCount: string;
  details: string;
  category: string;
}

interface RSVPDocument {
  _id?: ObjectId;
  slug: string;
  timestamp: Date;
  name: string;
  attending: string;
  guestCount: number;
  details: string;
  category: string;
}

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<RSVPDocument>("rsvp_responses");
}

export async function getRSVPResponses(slug: string): Promise<RSVPEntry[]> {
  const c = await col();
  const docs = await c.find({ slug }).sort({ timestamp: 1 }).toArray();
  return docs
    .filter((d) => d.name.trim() !== "")
    .map((d) => ({
      id: d._id!.toString(),
      timestamp: d.timestamp.toISOString(),
      name: d.name,
      attending: d.attending,
      guestCount: String(d.guestCount),
      details: d.details,
      category: d.category,
    }));
}

export async function addRSVPResponse(
  slug: string,
  data: { name: string; attending: string; guestCount: number; details: string },
): Promise<string> {
  const c = await col();
  const result = await c.insertOne({
    slug,
    timestamp: new Date(),
    name: data.name,
    attending: data.attending,
    guestCount: data.guestCount,
    details: data.details,
    category: "",
  });
  return result.insertedId.toString();
}

export async function deleteRSVPResponses(slug: string): Promise<number> {
  const c = await col();
  const result = await c.deleteMany({ slug });
  return result.deletedCount;
}

export async function updateRSVPCategory(
  id: string,
  category: string,
): Promise<void> {
  const c = await col();
  await c.updateOne({ _id: new ObjectId(id) }, { $set: { category } });
}

export async function updateRSVPGuestCount(
  id: string,
  guestCount: number,
): Promise<void> {
  const c = await col();
  await c.updateOne({ _id: new ObjectId(id) }, { $set: { guestCount } });
}

/**
 * Prebacuje potvrdu iz "nece doci" u "dolazi" i nazad.
 *
 * Gost koji je otkazao pa se naknadno predomislio je cesta situacija, a jedini
 * put nazad je do sada bio brisanje potvrde i rucni unos nove — cime se gubi
 * originalno vreme odgovora i veza sa zvanicom. Otkazivanje nulira broj osoba
 * i kategoriju, isto kao kad gost sam odgovori da ne dolazi.
 */
export async function updateRSVPAttending(
  id: string,
  attending: boolean,
  guestCount = 1,
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: attending
        ? { attending: "Da", guestCount: Math.max(1, guestCount) }
        : { attending: "Ne", guestCount: 0, category: "" },
    },
  );
}

export async function deleteRSVPResponse(id: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ _id: new ObjectId(id) });
}
