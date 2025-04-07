const mongoose = require("mongoose");

const InvestmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assetType: {
    type: String,
    enum: ["stocks", "mutual_funds", "ppf", "nps", "fixed_deposit", "gold", "crypto"],
    required: true,
  },
  name: { type: String, required: true }, // e.g., stock name, mutual fund name
  amountInvested: { type: Number, required: true },
  quantity: { type: Number, required: false }, // applicable for stocks, crypto, gold
  currentValue: { type: Number, required: false }, // auto-updated
  purchaseDate: { type: Date, required: true },
  lastUpdated: { type: Date, default: Date.now },
  tickerSymbol: {
    type: String,
    required: function () {
      return this.assetType === 'stock' || this.assetType === 'mutual_fund';
    }
  }
});


module.exports = mongoose.model("Investment", InvestmentSchema);
