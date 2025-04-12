import { NextApiRequest, NextApiResponse } from 'next';
import { Investment } from '../../../types/types';

// In production, this would interact with your database
let mockInvestments = [
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
    profitLoss: 200,
    profitLossPercentage: 20,
    date: new Date('2024-01-01'),
    lastUpdated: new Date()
  },
  // ... other mock investments ...
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid investment ID' });
  }

  // Handle PATCH request for updating investment
  if (req.method === 'PATCH') {
    try {
      const updates = req.body;
      const investment = mockInvestments.find(inv => inv._id === id);

      if (!investment) {
        return res.status(404).json({ error: 'Investment not found' });
      }

      // Calculate new values based on updates
      const updatedInvestment = {
        ...investment,
        ...updates,
        totalCost: updates.amount && updates.costBasis 
          ? updates.amount * updates.costBasis 
          : investment.totalCost,
        currentValue: updates.amount && investment.currentPrice
          ? updates.amount * investment.currentPrice
          : investment.currentValue,
        lastUpdated: new Date()
      };

      // Recalculate profit/loss
      if (updatedInvestment.currentValue && updatedInvestment.totalCost) {
        updatedInvestment.profitLoss = updatedInvestment.currentValue - updatedInvestment.totalCost;
        updatedInvestment.profitLossPercentage = (updatedInvestment.profitLoss / updatedInvestment.totalCost) * 100;
      }

      // Update the mock database
      mockInvestments = mockInvestments.map(inv =>
        inv._id === id ? updatedInvestment : inv
      );

      return res.status(200).json(updatedInvestment);
    } catch (error) {
      console.error('Update investment error:', error);
      return res.status(500).json({ error: 'Failed to update investment' });
    }
  }

  // Handle DELETE request
  if (req.method === 'DELETE') {
    try {
      const investmentExists = mockInvestments.some(inv => inv._id === id);

      if (!investmentExists) {
        return res.status(404).json({ error: 'Investment not found' });
      }

      mockInvestments = mockInvestments.filter(inv => inv._id !== id);
      return res.status(200).json({ message: 'Investment deleted successfully' });
    } catch (error) {
      console.error('Delete investment error:', error);
      return res.status(500).json({ error: 'Failed to delete investment' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 