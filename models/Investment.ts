import mongoose from 'mongoose';

const InvestmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Stock', 'Mutual Fund', 'PPF', 'NPS', 'FD', 'Gold', 'Crypto'],
  },
  ticker: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export default mongoose.models.Investment || mongoose.model('Investment', InvestmentSchema); 