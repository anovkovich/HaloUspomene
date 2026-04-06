import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";

export interface AudioMessage {
  _id: string;
  slug: string;
  guestName: string;
  blobUrl: string;
  blobPathname: string;
  durationMs: number;
  createdAt: string;
}

interface AudioDocument {
  slug: string;
  guestName: string;
  blobUrl: string;
  blobPathname: string;
  durationMs: number;
  createdAt: Date;
}

async function col() {
  const client = await clientPromise;
  return client.db("halouspomene").collection<AudioDocument>("audio_messages");
}

export async function getAudioMessages(slug: string): Promise<AudioMessage[]> {
  const c = await col();
  const docs = await c.find({ slug }).sort({ createdAt: 1 }).toArray();
  return docs.map((d) => ({
    _id: d._id.toString(),
    slug: d.slug,
    guestName: d.guestName,
    blobUrl: d.blobUrl,
    blobPathname: d.blobPathname,
    durationMs: d.durationMs,
    createdAt: d.createdAt.toISOString(),
  }));
}

export async function addAudioMessage(
  slug: string,
  data: {
    guestName: string;
    blobUrl: string;
    blobPathname: string;
    durationMs: number;
  }
): Promise<string> {
  const c = await col();
  const result = await c.insertOne({
    slug,
    guestName: data.guestName,
    blobUrl: data.blobUrl,
    blobPathname: data.blobPathname,
    durationMs: data.durationMs,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function deleteAudioMessage(id: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ _id: new ObjectId(id) });
}

export async function deleteAllAudioMessages(slug: string): Promise<number> {
  const c = await col();
  const result = await c.deleteMany({ slug });
  return result.deletedCount;
}

export async function getAudioMessageCount(slug: string): Promise<number> {
  const c = await col();
  return c.countDocuments({ slug });
}
