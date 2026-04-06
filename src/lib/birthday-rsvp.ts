import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

export interface BirthdayRSVPEntry {
  id: string;
  timestamp: string;
  name: string;
  attending: string;
  guestCount: string;
  message: string;
}

interface BirthdayRSVPDocument {
  _id?: ObjectId;
  slug: string;
  timestamp: Date;
  name: string;
  attending: string;
  guestCount: number;
  message: string;
}

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<BirthdayRSVPDocument>("birthday_rsvp");
}

export async function getBirthdayRSVP(slug: string): Promise<BirthdayRSVPEntry[]> {
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
      message: d.message,
    }));
}

export async function addBirthdayRSVP(
  slug: string,
  data: { name: string; attending: string; guestCount: number; message: string },
): Promise<string> {
  const c = await col();
  const result = await c.insertOne({
    slug,
    timestamp: new Date(),
    name: data.name,
    attending: data.attending,
    guestCount: data.guestCount,
    message: data.message,
  });
  return result.insertedId.toString();
}

export async function deleteBirthdayRSVPs(slug: string): Promise<number> {
  const c = await col();
  const result = await c.deleteMany({ slug });
  return result.deletedCount;
}
