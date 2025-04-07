// routes/seed.js
const express = require("express");
const router = express.Router();
const Investment = require("../models/Investment"); // Adjust path if needed

router.get("/", async (req, res) => {
  try {
    const dummyData = [
      {
        user: "67eed0fbea963fc5b3f2f300",
        assetType: "stocks", // match exactly what your schema enum allows
        name: "Apple",
        tickerSymbol: "AAPL",
        amountInvested: 10000,
        quantity: 2,
        purchaseDate: "2024-12-01",
        currentPrice: 5200,
      },
      {
        user: "67eed0fbea963fc5b3f2f300",
        assetType: "crypto",
        name: "Bitcoin",
        tickerSymbol: "BTC",
        amountInvested: 5000,
        quantity: 0.01,
        purchaseDate: "2024-12-01",
        currentPrice: 6000000,
      },
      {
        user: "67eed0fbea963fc5b3f2f300",
        assetType: "mutual_funds",
        name: "Axis Bluechip Fund",
        tickerSymbol: "AXISBLUE",
        amountInvested: 3000,
        quantity: 1.5,
        purchaseDate: "2024-11-01",
        currentPrice: 3100,
      },
    ];

    await Investment.insertMany(dummyData);

    res.status(200).json({ message: "Dummy data inserted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Seeding failed", error: err.message });
  }
});

module.exports = router;
