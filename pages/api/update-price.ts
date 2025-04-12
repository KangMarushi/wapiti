import { NextApiRequest, NextApiResponse } from 'next';
import { Investment } from '../../types/types';

// Mock function to simulate getting current price from an external API
async function getLatestPrice(ticker: string, type: string): Promise<number> {
  // In production, this would call a real price API
  return Math.random() * 100 + 50;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id, ticker, type } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker is required' });
    }

    // Get the latest price
    const newPrice = await getLatestPrice(ticker, type);

    // In production, this would update the database
    // For now, we'll just return the new price
    const investment = {
      ...req.body,
      currentPrice: newPrice,
      previousDayPrice: req.body.currentPrice || newPrice,
    };

    // Calculate daily change
    const dailyChange = newPrice - (investment.previousDayPrice || newPrice);
    const dailyChangePercentage = ((dailyChange / (investment.previousDayPrice || newPrice)) * 100);

    // Check if change is significant (±5%)
    if (Math.abs(dailyChangePercentage) >= 5) {
      // Create an alert
      await fetch(`${req.headers.origin}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentId: id,
          type: 'PRICE_CHANGE',
          message: `${investment.name} has ${dailyChangePercentage > 0 ? 'increased' : 'decreased'} by ${Math.abs(dailyChangePercentage).toFixed(2)}% today`,
          severity: Math.abs(dailyChangePercentage) >= 10 ? 'critical' : 'warning',
          changePercentage: dailyChangePercentage
        })
      });
    }

    return res.status(200).json({
      success: true,
      updatedPrice: newPrice,
      dailyChange,
      dailyChangePercentage,
      hasAlert: Math.abs(dailyChangePercentage) >= 5
    });
  } catch (error) {
    console.error('Update price error:', error);
    return res.status(500).json({ error: 'Failed to update price' });
  }
} 