import { NextApiRequest, NextApiResponse } from 'next';
import { Investment } from '../../types/types';

// This is a temporary mock data function
// In production, this would fetch from your database
function getMockInvestments(): Investment[] {
  return [
    {
      _id: '1',
      name: 'Apple Inc.',
      type: 'Stock',
      ticker: 'AAPL',
      amount: 10,  // 10 shares
      costBasis: 100,  // $100 per share
      totalCost: 1000,  // total investment
      currentPrice: 120,  // current price per share
      currentValue: 1200,  // current total value
      profitLoss: 200,  // current P&L
      profitLossPercentage: 20,  // P&L percentage
      date: new Date('2024-01-01'),
      lastUpdated: new Date()
    },
    {
      _id: '2',
      name: 'Bitcoin',
      type: 'Crypto',
      ticker: 'bitcoin',
      amount: 0.05,  // 0.05 BTC
      costBasis: 40000,  // $40,000 per BTC
      totalCost: 2000,  // total investment
      currentPrice: 50000,  // current price per BTC
      currentValue: 2500,  // current total value
      profitLoss: 500,  // current P&L
      profitLossPercentage: 25,  // P&L percentage
      date: new Date('2024-01-15'),
      lastUpdated: new Date()
    },
    {
      _id: '3',
      name: 'HDFC Bank',
      type: 'Stock',
      ticker: 'HDFCBANK',
      amount: 20,  // 20 shares
      costBasis: 1500,  // ₹1,500 per share
      totalCost: 30000,  // total investment
      currentPrice: 1450,  // current price per share
      currentValue: 29000,  // current total value
      profitLoss: -1000,  // current P&L
      profitLossPercentage: -3.33,  // P&L percentage
      date: new Date('2024-02-01'),
      lastUpdated: new Date()
    }
  ];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const investments = getMockInvestments();
    res.status(200).json({ investments });
  } catch (error) {
    console.error('Portfolio API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 