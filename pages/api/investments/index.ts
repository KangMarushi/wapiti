import { NextApiRequest, NextApiResponse } from 'next';
import { Investment } from '../../../types/types';

// In production, this would interact with your database
let mockInvestments: Omit<Investment, 'profitLoss' | 'profitLossPercentage'>[] = [
  {
    _id: '1',
    name: 'Apple Inc.',
    type: 'Stock',
    ticker: 'AAPL',
    amount: 10,
    costBasis: 100,
    totalCost: 1000,
    currentPrice: 120,
    currentValue: 1200,
    date: new Date('2024-01-01'),
    lastUpdated: new Date()
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle POST request for creating new investment
  if (req.method === 'POST') {
    try {
      const investment = req.body;

      // Generate a random ID (in production, this would be handled by your database)
      const newInvestment: Investment = {
        _id: Math.random().toString(36).substring(7),
        ...investment,
        currentPrice: investment.costBasis,  // Initially set to cost basis
        currentValue: investment.amount * investment.costBasis,
        profitLoss: 0,  // Initially no profit/loss
        profitLossPercentage: 0,
        date: new Date(),
        lastUpdated: new Date()
      };

        if (!newInvestment.ticker) {
            newInvestment.ticker = 'DEFAULT'; 
        }

      // Add to mock database
      mockInvestments.push(newInvestment);

      return res.status(201).json(newInvestment);
    } catch (error) {
      console.error('Create investment error:', error);
      return res.status(500).json({ error: 'Failed to create investment' });
    }
  }

  // Handle GET request for fetching all investments
  if (req.method === 'GET') {
    try {
      return res.status(200).json({ investments: mockInvestments });
    } catch (error) {
      console.error('Fetch investments error:', error);
      return res.status(500).json({ error: 'Failed to fetch investments' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}