import { NextApiRequest, NextApiResponse } from 'next';
import { Investment } from '../../types/types';

// In production, this would be fetched from your database
async function getAllInvestments(): Promise<Investment[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/portfolio`);
  const data = await res.json();
  return data.investments || [];
}

// Mock function to simulate getting current price from an external API
async function getLatestPrice(ticker: string, type: string): Promise<number> {
  // In production, this would call a real price API
  return Math.random() * 100 + 50;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests with the correct secret key
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify the secret key (in production, use a strong secret from env vars)
  const secretKey = req.headers['x-cron-secret'];
  if (secretKey !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const investments = await getAllInvestments();
    const updates: any[] = [];

    // Update each investment's price
    for (const inv of investments) {
      if (!inv.ticker) continue;

      try {
        const newPrice = await getLatestPrice(inv.ticker, inv.type);
        
        // Calculate changes
        const dailyChange = newPrice - (inv.currentPrice || newPrice);
        const dailyChangePercentage = ((dailyChange / (inv.currentPrice || newPrice)) * 100);

        // Create alert if needed
        if (Math.abs(dailyChangePercentage) >= 5) {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              investmentId: inv._id,
              type: 'PRICE_CHANGE',
              message: `${inv.name} has ${dailyChangePercentage > 0 ? 'increased' : 'decreased'} by ${Math.abs(dailyChangePercentage).toFixed(2)}% today`,
              severity: Math.abs(dailyChangePercentage) >= 10 ? 'critical' : 'warning',
              changePercentage: dailyChangePercentage
            })
          });
        }

        updates.push({
          id: inv._id,
          oldPrice: inv.currentPrice,
          newPrice,
          dailyChange,
          dailyChangePercentage
        });

      } catch (error) {
        console.error(`Failed to update ${inv.name}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Updated ${updates.length} investments`,
      updates
    });

  } catch (error) {
    console.error('Batch update error:', error);
    return res.status(500).json({ error: 'Failed to perform batch update' });
  }
} 