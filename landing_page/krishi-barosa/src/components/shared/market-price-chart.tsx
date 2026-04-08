"use client";

/**
 * MARKET PRICE CHART COMPONENT
 * 
 * Displays interactive candlestick/line charts for commodity prices.
 * Shows OHLC (Open, High, Low, Close) data with volume.
 * 
 * Features:
 * - Candlestick chart for daily price movements
 * - Volume bar chart
 * - Date range selector (7/30/90 days)
 * - Commodity filter
 * - Responsive design
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest: number;
}

interface MarketPriceChartProps {
  commodity?: string;
  defaultDays?: number;
}

export function MarketPriceChart({ 
  commodity = 'WHEAT',
  defaultDays = 30 
}: MarketPriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [days, setDays] = useState(defaultDays);
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState(commodity);

  // Fetch price history
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/market-prices/history?commodity=${selectedCommodity}&days=${days}`
      );
      const data = await response.json();
      
      if (data.success) {
        setPriceHistory(data.priceHistory || []);
      }
    } catch (error) {
      console.error('❌ Failed to fetch price history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [days, selectedCommodity]);

  // Calculate price statistics
  const getStats = () => {
    if (priceHistory.length === 0) {
      return { current: 0, change: 0, changePercent: 0, high: 0, low: 0 };
    }

    const latest = priceHistory[priceHistory.length - 1];
    const oldest = priceHistory[0];
    const change = latest.close - oldest.close;
    const changePercent = (change / oldest.close) * 100;
    
    const high = Math.max(...priceHistory.map(p => p.high));
    const low = Math.min(...priceHistory.map(p => p.low));

    return {
      current: latest.close,
      change,
      changePercent,
      high,
      low
    };
  };

  const stats = getStats();
  const isPositive = stats.change >= 0;

  // Render candlestick SVG (simplified)
  const renderCandlestickChart = () => {
    if (priceHistory.length === 0) return null;

    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate scales
    const priceMax = Math.max(...priceHistory.map(p => p.high));
    const priceMin = Math.min(...priceHistory.map(p => p.low));
    const priceRange = priceMax - priceMin;

    const xScale = (index: number) => 
      padding.left + (index / (priceHistory.length - 1)) * chartWidth;
    
    const yScale = (price: number) =>
      padding.top + chartHeight - ((price - priceMin) / priceRange) * chartHeight;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight * (1 - ratio);
          const price = priceMin + priceRange * ratio;
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
              >
                ₹{price.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Candlesticks */}
        {priceHistory.map((price, index) => {
          const x = xScale(index);
          const candleWidth = Math.max(chartWidth / priceHistory.length - 2, 2);
          
          const openY = yScale(price.open);
          const closeY = yScale(price.close);
          const highY = yScale(price.high);
          const lowY = yScale(price.low);

          const isUp = price.close >= price.open;
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.abs(closeY - openY) || 1;

          return (
            <g key={index}>
              {/* High-Low line (wick) */}
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={isUp ? '#22c55e' : '#ef4444'}
                strokeWidth="1"
              />
              
              {/* Open-Close body */}
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isUp ? '#22c55e' : '#ef4444'}
                opacity={0.8}
              />
            </g>
          );
        })}

        {/* X-axis dates */}
        {priceHistory.filter((_, i) => i % Math.ceil(priceHistory.length / 7) === 0).map((price, index) => {
          const dataIndex = index * Math.ceil(priceHistory.length / 7);
          const x = xScale(dataIndex);
          return (
            <text
              key={index}
              x={x}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
            >
              {new Date(price.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {selectedCommodity} Price Chart
          </CardTitle>
          
          {/* Date range selector */}
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? "default" : "outline"}
                onClick={() => setDays(d)}
              >
                {d}D
              </Button>
            ))}
          </div>
        </div>

        {/* Price stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-500">Current</p>
            <p className="text-lg font-bold">₹{stats.current.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Change</p>
            <p className={`text-lg font-bold flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stats.changePercent.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">High ({days}D)</p>
            <p className="text-lg font-bold text-green-600">₹{stats.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Low ({days}D)</p>
            <p className="text-lg font-bold text-red-600">₹{stats.low.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : priceHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Calendar className="w-12 h-12 mb-2 opacity-50" />
            <p>No price data available for this period</p>
            <p className="text-sm">Try fetching historical data first</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            {renderCandlestickChart()}
            
            {/* Volume chart (simplified bars) */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Volume Trend</p>
              <div className="flex items-end gap-1 h-20">
                {priceHistory.map((price, index) => {
                  const maxVolume = Math.max(...priceHistory.map(p => p.volume));
                  const height = (price.volume / maxVolume) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-blue-500 opacity-60 hover:opacity-100 transition-opacity"
                      style={{ height: `${height}%` }}
                      title={`${new Date(price.date).toLocaleDateString()}: ${price.volume.toLocaleString()}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
