const SUPPORTED_STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

const INITIAL_PRICES = {
  GOOG: 140.5,
  TSLA: 242.8,
  AMZN: 178.3,
  META: 512.2,
  NVDA: 880.45,
};

class PriceService {
  constructor() {
    this.prices = { ...INITIAL_PRICES };
    this.clients = new Map(); // Map of WebSocket clients
  }

  // Start broadcasting price updates
  startBroadcasting() {
    setInterval(() => {
      this.updatePrices();
      this.broadcastPrices();
    }, 1000); // Update every second
  }

  // Generate random price changes
  updatePrices() {
    SUPPORTED_STOCKS.forEach((ticker) => {
      const currentPrice = this.prices[ticker];
      const changePercent = (Math.random() - 0.5) * 0.02; // -1% to +1%
      const newPrice = currentPrice * (1 + changePercent);
      this.prices[ticker] = parseFloat(newPrice.toFixed(2));
    });
  }

  // Broadcast prices to all connected clients
  broadcastPrices() {
    const priceUpdate = {
      type: "PRICE_UPDATE",
      data: this.prices,
      timestamp: Date.now(),
    };

    this.clients.forEach((client, ws) => {
      if (ws.readyState === 1) {
        // WebSocket.OPEN
        ws.send(JSON.stringify(priceUpdate));
      }
    });
  }

  // Add a new WebSocket client
  addClient(ws, userId) {
    this.clients.set(ws, userId);

    // Send initial prices
    ws.send(
      JSON.stringify({
        type: "INITIAL_PRICES",
        data: this.prices,
        timestamp: Date.now(),
      })
    );

    console.log(`✅ Client connected. Total clients: ${this.clients.size}`);
  }

  // Remove a WebSocket client
  removeClient(ws) {
    this.clients.delete(ws);
    console.log(`❌ Client disconnected. Total clients: ${this.clients.size}`);
  }

  // Get current prices
  getCurrentPrices() {
    return this.prices;
  }

  // Get initial prices (for calculating day change)
  getInitialPrices() {
    return INITIAL_PRICES;
  }
}

module.exports = new PriceService();
