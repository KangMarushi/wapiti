// pages/api/seed.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();

  const dummyData = [
    {
      userId: "test-user",
      assetType: "Stock",
      name: "JK Cement Ltd",
      ticker: "JKCEMENT",
      amount: 10000,
      quantity: 2,
      date: "2024-12-01",
      currentPrice: 5200,
    },
    {
      userId: "test-user",
      assetType: "Crypto",
      name: "Bitcoin",
      ticker: "BTC",
      amount: 5000,
      quantity: 0.01,
      date: "2024-12-01",
      currentPrice: 6000000,
    },
    {
      userId: "test-user",
      assetType: "Mutual Fund",
      name: "Axis Bluechip Fund",
      ticker: "AXISBLUE",
      amount: 3000,
      quantity: 1.5,
      date: "2024-11-01",
      currentPrice: 3100,
    },
  ];

  await db.collection("investments").insertMany(dummyData);
  res.status(200).json({ message: "Dummy data inserted." });
}
