const cron = require("node-cron");
const Investment = require("../models/Investment");
const PortfolioSnapshot = require("../models/PortfolioSnapshot");
const Notification = require("../models/Notification");
const User = require("../models/User");

cron.schedule("0 9 * * *", async () => {
  console.log("🔁 Running daily portfolio monitor...");

  const users = await User.find();

  for (const user of users) {
    const investments = await Investment.find({ user: user._id });
    const totalValue = investments.reduce((acc, inv) => acc + (inv.currentValue || 0), 0);

    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today - 86400000); // 1 day ago

    const prevSnapshot = await PortfolioSnapshot.findOne({ user: user._id, date: yesterday });

    if (prevSnapshot) {
      const change = ((totalValue - prevSnapshot.value) / prevSnapshot.value) * 100;

      if (Math.abs(change) >= 5) {
        const message = change > 0
          ? `🚀 Your portfolio increased by ${change.toFixed(2)}% since yesterday!`
          : `📉 Your portfolio dropped by ${Math.abs(change).toFixed(2)}% since yesterday.`;

        await Notification.create({
          user: user._id,
          message,
        });
      }
    }

    // Save today’s snapshot (overwrite if exists)
    await PortfolioSnapshot.findOneAndUpdate(
      { user: user._id, date: today },
      { value: totalValue },
      { upsert: true }
    );
  }

  console.log("✅ Portfolio monitoring finished.");
});
