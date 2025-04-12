import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { Investment } from '../../../types/types';

interface PortfolioAnalysis {
  totalValue: number;
  totalCost: number;
  overallReturn: number;
  overallReturnPercentage: number;
  typeDistribution: {
    [key: string]: {
      value: number;
      percentage: number;
      count: number;
    };
  };
  insights: {
    overexposure: string[];
    underperformers: string[];
    topPerformers: string[];
    rebalancingSuggestions: string[];
  };
  monthlyPerformance: {
    month: string;
    value: number;
    return: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const investments = await db.collection<Investment>('investments').find({}).toArray();

    // Calculate basic portfolio metrics
    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalCost = investments.reduce((sum, inv) => sum + inv.totalCost, 0);
    const overallReturn = totalValue - totalCost;
    const overallReturnPercentage = (overallReturn / totalCost) * 100;

    // Calculate type distribution
    const typeDistribution: PortfolioAnalysis['typeDistribution'] = {};
    investments.forEach((inv) => {
      if (!typeDistribution[inv.type]) {
        typeDistribution[inv.type] = { value: 0, percentage: 0, count: 0 };
      }
      typeDistribution[inv.type].value += inv.currentValue;
      typeDistribution[inv.type].count += 1;
    });

    // Calculate percentages for each type
    Object.keys(typeDistribution).forEach((type) => {
      typeDistribution[type].percentage = (typeDistribution[type].value / totalValue) * 100;
    });

    // Generate insights
    const insights = {
      overexposure: [],
      underperformers: [],
      topPerformers: [],
      rebalancingSuggestions: []
    };

    // Check for overexposure (>30% in any single type)
    Object.entries(typeDistribution).forEach(([type, data]) => {
      if (data.percentage > 30) {
        insights.overexposure.push(
          `Your portfolio is heavily concentrated in ${type} (${data.percentage.toFixed(1)}%). Consider diversifying.`
        );
      }
    });

    // Identify underperforming and top performing investments
    const performanceThreshold = -10; // -10% return threshold for underperformers
    const topPerformerThreshold = 15; // 15% return threshold for top performers

    investments.forEach((inv) => {
      const returnPercentage = ((inv.currentValue - inv.totalCost) / inv.totalCost) * 100;
      
      if (returnPercentage < performanceThreshold) {
        insights.underperformers.push(
          `${inv.name} is underperforming with ${returnPercentage.toFixed(1)}% return. Consider reviewing this investment.`
        );
      }
      
      if (returnPercentage > topPerformerThreshold) {
        insights.topPerformers.push(
          `${inv.name} is performing well with ${returnPercentage.toFixed(1)}% return.`
        );
      }
    });

    // Generate rebalancing suggestions
    const idealDistribution = 100 / Object.keys(typeDistribution).length;
    Object.entries(typeDistribution).forEach(([type, data]) => {
      const diff = data.percentage - idealDistribution;
      if (Math.abs(diff) > 10) {
        const action = diff > 0 ? 'reduce' : 'increase';
        insights.rebalancingSuggestions.push(
          `Consider ${action === 'reduce' ? 'reducing' : 'increasing'} your ${type} allocation by ${Math.abs(diff).toFixed(1)}% for better diversification.`
        );
      }
    });

    // Calculate monthly performance (mock data for now)
    const monthlyPerformance = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i, 1).toLocaleString('default', { month: 'short' });
      const value = totalValue * (1 + (Math.random() * 0.1 - 0.05));
      const return_ = ((value - totalValue) / totalValue) * 100;
      return {
        month,
        value,
        return: return_
      };
    });

    const analysis: PortfolioAnalysis = {
      totalValue,
      totalCost,
      overallReturn,
      overallReturnPercentage,
      typeDistribution,
      insights,
      monthlyPerformance
    };

    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    return res.status(500).json({ message: 'Failed to analyze portfolio' });
  }
} 