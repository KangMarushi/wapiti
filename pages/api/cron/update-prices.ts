import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { Investment } from '../../../types/types';
import { ObjectId } from 'mongodb';

// Verify the request is from the CRON job
const verifyCronSecret = (req: NextApiRequest): boolean => {
  const cronSecret = process.env.CRON_SECRET;
  return req.headers['x-cron-secret'] === cronSecret;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify the request is from our CRON job
  if (!verifyCronSecret(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { db, client } = await connectToDatabase();
    const investments = await db.collection<Investment>('investments').find({}).toArray();

    // Update each investment's price
    const updatedInvestments = await Promise.all(
      investments.map(async (investment) => {
        if (!investment.ticker) return investment;

        try {
          // Mock price update for now - replace with actual API call
          const newPrice = investment.costBasis * (1 + (Math.random() * 0.1 - 0.05));
          const currentValue = newPrice * investment.amount;
          const profitLoss = currentValue - investment.totalCost;
          const profitLossPercentage = (profitLoss / investment.totalCost) * 100;

          // Update the investment in the database
          await db.collection('investments').updateOne(
            { _id: new ObjectId(investment._id) },
            {
              $set: {
                costBasis: newPrice,
                currentValue,
                profitLoss,
                profitLossPercentage,
                lastUpdated: new Date()
              }
            }
          );

          return {
            ...investment,
            costBasis: newPrice,
            currentValue,
            profitLoss,
            profitLossPercentage,
            lastUpdated: new Date()
          };
        } catch (error) {
          console.error(`Failed to update price for ${investment.ticker}:`, error);
          return investment;
        }
      })
    );

    return res.status(200).json({
      message: 'Prices updated successfully',
      investments: updatedInvestments
    });
  } catch (error) {
    console.error('Error updating prices:', error);
    return res.status(500).json({ message: 'Failed to update prices' });
  }
}