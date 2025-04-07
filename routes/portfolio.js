const express = require("express");
const router = express.Router();
const Investment = require("../models/Investment");
const authMiddleware = require("../middleware/auth");

const {
  calculateMonthlyInvestmentAverage,
  calculatePortfolioGrowth,
  calculateFinancialHealthScore,
} = require("../utils/portfolioAnalysis");

router.get("/overview", authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id });

    const monthly = calculateMonthlyInvestmentAverage(investments);
    const growth = calculatePortfolioGrowth(investments);
    const healthScore = calculateFinancialHealthScore(growth);

    res.json({
      monthly,
      growth,
      healthScore,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
