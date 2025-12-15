const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  ticker: {
    type: String,
    required: true,
    uppercase: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate subscriptions
subscriptionSchema.index({ userId: 1, ticker: 1 }, { unique: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
