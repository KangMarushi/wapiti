import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import { fetchLivePrice } from "../../../lib/fetchLivePrice";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, type, ticker } = req.body;
  if (!id || !type || !ticker) return res.status(400).json({ error: "Missing params" });

  try {
    const priceData = await fetchLivePrice(type, ticker);
    const { db } = await connectToDatabase();

    await db.collection("investments").updateOne(
      { _id: id },
      {
        $set: {
          ticker,
          currentValue: priceData.price,
          updatedAt: new Date(),
        },
      }
    );

    res.json({ success: true, updatedPrice: priceData.price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update price" });
  }
}
