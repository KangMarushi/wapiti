import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb"; // you already set this up

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();
  const userId = req.headers["x-user-id"]; // replace with auth later

  const investments = await db.collection("investments").find({ userId }).toArray();

  // 1. Breakdown by asset type
  const breakdown = investments.reduce((acc, inv) => {
    acc[inv.assetType] = (acc[inv.assetType] || 0) + inv.amount;
    return acc;
  }, {} as Record<string, number>);

  const breakdownArray = Object.entries(breakdown).map(([assetType, amount]) => ({
    assetType,
    amount,
  }));

  // 2. Growth over time (by date)
  const dateMap = new Map();
  investments.forEach((inv) => {
    const date = inv.date.split("T")[0];
    dateMap.set(date, (dateMap.get(date) || 0) + inv.amount);
  });

  const growth = Array.from(dateMap.entries()).sort().map(([date, totalValue]) => ({
    date,
    totalValue,
  }));

  // 3. Insights
  const monthMap = new Map();
  investments.forEach((inv) => {
    const month = inv.date.slice(0, 7); // yyyy-mm
    monthMap.set(month, (monthMap.get(month) || 0) + inv.amount);
  });

  const months = Array.from(monthMap.values());
  const avgMonthly = Math.round(months.reduce((a, b) => a + b, 0) / months.length);

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const todayValue = investments
    .filter((i) => i.date.slice(0, 10) === today)
    .reduce((sum, i) => sum + i.amount, 0);
  const yesterdayValue = investments
    .filter((i) => i.date.slice(0, 10) === yesterday)
    .reduce((sum, i) => sum + i.amount, 0);

  const changeToday =
    yesterdayValue > 0 ? +(((todayValue - yesterdayValue) / yesterdayValue) * 100).toFixed(2) : 0;

  const sorted = [...investments].sort((a, b) => b.currentPrice - a.currentPrice);
  const topGainer = sorted[0]?.name || "-";
  const topLoser = sorted[sorted.length - 1]?.name || "-";

  return res.status(200).json({
    breakdown: breakdownArray,
    growth,
    insights: { avgMonthly, changeToday, topGainer, topLoser },
  });
}
