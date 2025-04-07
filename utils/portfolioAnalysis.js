const moment = require("moment");

const calculateMonthlyInvestmentAverage = (investments) => {
  const monthlyTotals = {};

  investments.forEach((inv) => {
    const monthKey = moment(inv.date).format("YYYY-MM");

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = 0;
    }

    monthlyTotals[monthKey] += inv.amount;
  });

  const months = Object.keys(monthlyTotals);
  const total = Object.values(monthlyTotals).reduce((a, b) => a + b, 0);
  const average = months.length ? total / months.length : 0;

  return {
    months,
    totalInvested: total,
    averageMonthlyInvestment: average,
  };
};

const calculatePortfolioGrowth = (investments) => {
  const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0);
  const currentValue = investments.reduce((acc, inv) => acc + (inv.currentValue || 0), 0);
  const gain = currentValue - totalInvested;

  return {
    totalInvested,
    currentValue,
    gain,
    gainPercent: totalInvested > 0 ? (gain / totalInvested) * 100 : 0,
  };
};

const calculateFinancialHealthScore = (growth) => {
  const { gainPercent, totalInvested } = growth;
  let score = 50;

  if (gainPercent > 15) score += 25;
  if (totalInvested > 500000) score += 10;

  return Math.min(score, 100);
};

module.exports = {
  calculateMonthlyInvestmentAverage,
  calculatePortfolioGrowth,
  calculateFinancialHealthScore,
};
