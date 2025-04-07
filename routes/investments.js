const express = require("express");
const Investment = require("../models/Investment");
const authMiddleware = require("../middleware/auth");
const { getStockPrice, getCryptoPrice, getGoldPrice } = require("../services/marketData");
const router = express.Router();

// Add Investment
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { assetType, name, amountInvested, quantity, purchaseDate } = req.body;

    const investment = new Investment({
      user: req.user.id,
      assetType,
      name,
      amountInvested,
      quantity,
      purchaseDate,
    });

    await investment.save();
    res.status(201).json({ message: "Investment added successfully", investment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Investments
router.get("/", authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Investment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Investment.findByIdAndDelete(req.params.id);
    res.json({ message: "Investment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get updated investment values
router.get("/update-prices", authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id });

    for (let inv of investments) {
      let updatedPrice = null;

      if (inv.assetType === "stocks" || inv.assetType === "mutual_funds") {
        updatedPrice = await getStockPrice(inv.name);
      } else if (inv.assetType === "crypto") {
        updatedPrice = await getCryptoPrice(inv.name.toLowerCase());
      } else if (inv.assetType === "gold") {
        updatedPrice = await getGoldPrice();
      }

      if (updatedPrice) {
        inv.currentValue = updatedPrice * (inv.quantity || 1);
        inv.lastUpdated = new Date();
        await inv.save();
      }
    }

    res.json({ message: "Prices updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
