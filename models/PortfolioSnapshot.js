const mongoose = require("mongoose");

const PortfolioSnapshotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0),
  },
});

PortfolioSnapshotSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("PortfolioSnapshot", PortfolioSnapshotSchema);
