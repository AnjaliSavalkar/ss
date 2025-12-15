import React, { useState, useEffect } from "react";
import { LogOut, Plus, Activity, Wifi, WifiOff } from "lucide-react";
import { subscriptionsAPI } from "../services/api";
import websocketService from "../services/websocket";
import StockCard from "./StockCard";

const SUPPORTED_STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

export default function Dashboard({ user, token, onLogout }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [prices, setPrices] = useState({});
  const [initialPrices, setInitialPrices] = useState({});
  const [priceChanges, setPriceChanges] = useState({});
  const [showAddStock, setShowAddStock] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
    connectWebSocket();

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const loadSubscriptions = async () => {
    try {
      const data = await subscriptionsAPI.getSubscriptions();
      setSubscriptions(data.subscriptions);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = async () => {
    try {
      await websocketService.connect(token);
      setWsConnected(true);

      // Listen for initial prices
      websocketService.on("INITIAL_PRICES", (data) => {
        setPrices(data.data);
        setInitialPrices(data.data);
      });

      // Listen for price updates
      websocketService.on("PRICE_UPDATE", (data) => {
        setPrices((prevPrices) => {
          const newPrices = data.data;
          const changes = {};

          Object.keys(newPrices).forEach((ticker) => {
            if (prevPrices[ticker] !== undefined) {
              changes[ticker] =
                newPrices[ticker] > prevPrices[ticker] ? "up" : "down";
            }
          });

          setPriceChanges(changes);
          setTimeout(() => setPriceChanges({}), 500);

          return newPrices;
        });
      });

      websocketService.on("AUTH_SUCCESS", () => {
        console.log("✅ WebSocket authenticated");
      });
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      setWsConnected(false);
    }
  };

  const handleAddSubscription = async (ticker) => {
    try {
      await subscriptionsAPI.addSubscription(ticker);
      setSubscriptions([...subscriptions, ticker]);
      setShowAddStock(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add subscription");
    }
  };

  const handleRemoveSubscription = async (ticker) => {
    try {
      await subscriptionsAPI.removeSubscription(ticker);
      setSubscriptions(subscriptions.filter((t) => t !== ticker));
    } catch (error) {
      alert("Failed to remove subscription");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    websocketService.disconnect();
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Stock Portfolio
              </h1>
              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  wsConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {wsConnected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">
                  {wsConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Add Stock Button */}
        {subscriptions.length < SUPPORTED_STOCKS.length && (
          <button
            onClick={() => setShowAddStock(!showAddStock)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors mb-6 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Subscribe to Stock
          </button>
        )}

        {/* Add Stock Panel */}
        {showAddStock && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Available Stocks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {SUPPORTED_STOCKS.filter(
                (ticker) => !subscriptions.includes(ticker)
              ).map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => handleAddSubscription(ticker)}
                  className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock Cards */}
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Subscriptions
            </h3>
            <p className="text-gray-600">
              Subscribe to stocks to start tracking prices in real-time
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((ticker) => (
              <StockCard
                key={ticker}
                ticker={ticker}
                currentPrice={prices[ticker] || 0}
                initialPrice={initialPrices[ticker] || 0}
                priceChange={priceChanges[ticker]}
                onRemove={handleRemoveSubscription}
              />
            ))}
          </div>
        )}

        {/* Live Indicator */}
        {wsConnected && (
          <div className="mt-6 flex justify-center items-center gap-2 text-white">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live updates via WebSocket</span>
          </div>
        )}
      </div>
    </div>
  );
}
