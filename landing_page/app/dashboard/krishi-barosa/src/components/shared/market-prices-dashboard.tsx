/**
 * Market Prices Dashboard Component
 * 
 * Displays real-time NCDEX commodity prices for farmers
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface MarketPrice {
  id: string;
  commodityCode: string;
  commodityName: string;
  symbol: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  lastPrice: number;
  settlePrice: number;
  volume: number;
  tradeDate: string;
  fetchedAt: string;
}

export function MarketPricesDashboard() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/market-prices');
      const data = await response.json();
      
      if (data.success) {
        setPrices(data.latestPrices);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching market prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getPriceChange = (price: MarketPrice) => {
    if (!price.openPrice || !price.closePrice) return null;
    const change = price.closePrice - price.openPrice;
    const changePercent = (change / price.openPrice) * 100;
    return { change, changePercent };
  };

  if (isLoading && prices.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading market prices...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            NCDEX Market Prices
          </h2>
          <p className="text-gray-600 mt-1">
            Live commodity prices from National Commodity Exchange
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              <Calendar className="h-4 w-4 inline mr-1" />
              Updated: {format(lastUpdated, 'PPp')}
            </div>
          )}
          <Button onClick={fetchPrices} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {prices.map((price) => {
          const priceChange = getPriceChange(price);
          const isPositive = priceChange && priceChange.change >= 0;

          return (
            <Card key={price.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{price.commodityName}</CardTitle>
                    <CardDescription className="text-xs">{price.symbol}</CardDescription>
                  </div>
                  {priceChange && (
                    <Badge 
                      variant={isPositive ? "default" : "destructive"}
                      className="gap-1"
                    >
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {priceChange.changePercent > 0 ? '+' : ''}
                      {priceChange.changePercent.toFixed(2)}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Current Price */}
                <div>
                  <p className="text-xs text-gray-500">Close Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{price.closePrice?.toFixed(2) || price.lastPrice?.toFixed(2) || '-'}
                  </p>
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-xs text-gray-600">High</p>
                    <p className="font-semibold text-blue-700">₹{price.highPrice?.toFixed(2) || '-'}</p>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <p className="text-xs text-gray-600">Low</p>
                    <p className="font-semibold text-red-700">₹{price.lowPrice?.toFixed(2) || '-'}</p>
                  </div>
                </div>

                {/* Volume */}
                {price.volume && (
                  <div className="text-xs text-gray-500">
                    Volume: {price.volume.toLocaleString()} units
                  </div>
                )}

                {/* Trade Date */}
                <div className="text-xs text-gray-400 border-t pt-2">
                  Trade Date: {format(new Date(price.tradeDate), 'PP')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {prices.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No market prices available</p>
            <p className="text-gray-500 text-sm mt-2">
              Run the NCDEX fetcher script to populate market data
            </p>
            <Button onClick={fetchPrices} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
