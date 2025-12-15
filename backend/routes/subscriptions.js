const express = require("express");
const jwt = require("jsonwebtoken");
const Subscription = require("../models/Subscription");

const router = express.Router();

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get user's subscriptions
router.get("/", authMiddleware, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.userId });
    const tickers = subscriptions.map((sub) => sub.ticker);
    res.json({ subscriptions: tickers });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add subscription
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { ticker } = req.body;

    const subscription = new Subscription({
      userId: req.user.userId,
      email: req.user.email,
      ticker: ticker.toUpperCase(),
    });

    await subscription.save();

    res.status(201).json({
      message: "Subscription added",
      ticker: subscription.ticker,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Already subscribed to this stock" });
    }
    console.error("Add subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove subscription
router.delete("/:ticker", authMiddleware, async (req, res) => {
  try {
    const { ticker } = req.params;

    await Subscription.deleteOne({
      userId: req.user.userId,
      ticker: ticker.toUpperCase(),
    });

    res.json({ message: "Subscription removed" });
  } catch (error) {
    console.error("Remove subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
