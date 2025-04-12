const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");
const authRoutes = require("./auth");
const investmentRoutes = require("./routes/investments");
const cron = require("node-cron");
const { getStockPrice, getCryptoPrice, getGoldPrice } = require("./services/marketData");
const portfolioRoutes = require("./routes/portfolio");
const tickerRoutes = require("./routes/ticker");
const app = express();
const seedRoute = require("./routes/seed");
require("./jobs/portfolioMonitor");

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/investments", investmentRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/api/seed", seedRoute);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/ticker", tickerRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Run price update every 6 hours
cron.schedule("0 */6 * * *", async () => {
  console.log("Updating investment prices...");
  try {
    const investments = await Investment.find({});
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
    console.log("Investment prices updated.");
  } catch (error) {
    console.error(`Price update failed: ${error.message}`);
  }
});