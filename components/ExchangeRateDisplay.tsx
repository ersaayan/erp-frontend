"use client";

import React, { useEffect, useState } from "react";
import { currencyService } from "@/lib/services/currency";
import { Loader2 } from "lucide-react";

const ExchangeRateDisplay: React.FC = () => {
  const [rates, setRates] = useState<{
    USD_TRY: number;
    EUR_TRY: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await currencyService.getExchangeRates();
        setRates(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch rates");
        console.error("Error fetching rates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();

    // Update rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading rates...</span>
      </div>
    );
  }

  if (error || !rates) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-green-600">$ {rates.USD_TRY.toFixed(4)}</span>
      <span className="text-red-600">€ {rates.EUR_TRY.toFixed(4)}</span>
    </div>
  );
};

export default ExchangeRateDisplay;
