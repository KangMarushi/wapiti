export interface Investment {
  _id: string;
  name: string;
  type: string;
  ticker?: string;
  amount: number;  // quantity of units
  costBasis: number;  // purchase price per unit
  totalCost: number;  // total investment cost
  currentValue?: number;
  currentPrice?: number;  // current price per unit
  previousDayPrice?: number;  // previous day's price
  dailyChange?: number;  // daily change amount
  dailyChangePercentage?: number;  // daily change percentage
  profitLoss?: number;  // current P&L
  profitLossPercentage?: number;  // P&L as percentage
  date?: Date;  // purchase date
  lastUpdated?: Date;
  hasAlert?: boolean;  // indicates if there's an active alert
}

export interface Alert {
  id: string;
  investmentId: string;
  type: 'PRICE_CHANGE' | 'TARGET_REACHED' | 'STOP_LOSS';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  isRead: boolean;
  changePercentage?: number;
}

export interface TickerData {
  symbol: string;
  price: number;
  type: 'stock' | 'crypto' | 'mutual_fund';
  change?: number;
  changePercent?: number;
  lastUpdated?: string;
  currency?: string;
  name?: string;
}

export interface PortfolioAnalysis {
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