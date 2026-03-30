import { nanoid } from "nanoid";
import clientPromise from "./mongodb";

export interface PhoneRental {
  id: string;
  contact_name: string;
  rental_date: string; // ISO date (pickup date)
  notes?: string;
  dobrodoslica?: boolean; // personalized welcome message addon
  custom_discount?: number;
  receipt_valid?: boolean;
  receipt_created?: string;
  created_at: string;
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db("halouspomene");
  return db.collection<PhoneRental>("phone_rentals");
}

export async function getAllPhoneRentals(): Promise<PhoneRental[]> {
  const col = await getCollection();
  return col
    .find({})
    .sort({ rental_date: 1 })
    .toArray();
}

export async function getPhoneRentalById(id: string): Promise<PhoneRental | null> {
  const col = await getCollection();
  return col.findOne({ id });
}

export async function createPhoneRental(data: Omit<PhoneRental, "id" | "created_at">): Promise<PhoneRental> {
  const id = "tel-" + nanoid(8);
  const created_at = new Date().toISOString();
  const doc: PhoneRental = {
    ...data,
    id,
    created_at,
  };
  const col = await getCollection();
  await col.insertOne(doc);
  return doc;
}

export async function patchPhoneRental(
  id: string,
  updates: Partial<PhoneRental>
): Promise<PhoneRental | null> {
  const col = await getCollection();
  const result = await col.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: "after" }
  );
  return (result as any) || null;
}

export async function deletePhoneRental(id: string): Promise<boolean> {
  const col = await getCollection();
  const result = await col.deleteOne({ id });
  return result.deletedCount > 0;
}
