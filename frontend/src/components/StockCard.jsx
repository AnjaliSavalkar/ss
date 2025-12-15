import React from "react";
import { TrendingUp, TrendingDown, X } from "lucide-react";

export default function StockCard({
  ticker,
  currentPrice,
  initialPrice,
  priceChange,
  onRemove,
}) {
  const dayChange = (
    ((currentPrice - initialPrice) / initialPrice) *
    100
  ).toFixed(2);
  const isPositive = parseFloat(dayChange) >= 0;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
        priceChange === "up"
          ? "ring-2 ring-green-400"
          : priceChange === "down"
          ? "ring-2 ring-red-400"
          : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{ticker}</h3>
          <p className="text-sm text-gray-500">Real-time</p>
        </div>
        <button
          onClick={() => onRemove(ticker)}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900">
          ${currentPrice.toFixed(2)}
        </div>
      </div>

      <div
        className={`flex items-center gap-2 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-5 h-5" />
        ) : (
          <TrendingDown className="w-5 h-5" />
        )}
        <span className="font-semibold">
          {isPositive ? "+" : ""}
          {dayChange}%
        </span>
        <span className="text-sm text-gray-500">today</span>
      </div>
    </div>
  );
}
