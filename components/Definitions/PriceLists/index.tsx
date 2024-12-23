"use client";

import React, { useState, useEffect } from "react";
import PriceListsGrid from "./PriceListsGrid";
import PriceListDialog from "./PriceListDialog";
import PriceListsToolbar from "./PriceListsToolbar";
import { usePriceListDialog } from "./usePriceListDialog";
import { PriceList } from "./types";

const PriceLists: React.FC = () => {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen } = usePriceListDialog();

  const fetchPriceLists = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/priceLists`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch price lists");
      }

      const data = await response.json();
      setPriceLists(data);
    } catch (error) {
      console.error("Error fetching price lists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceLists();

    const handleRefresh = () => {
      fetchPriceLists();
    };

    window.addEventListener("refreshPriceLists", handleRefresh);
    return () => {
      window.removeEventListener("refreshPriceLists", handleRefresh);
    };
  }, []);

  return (
    <div className="space-y-4">
      <PriceListsToolbar />
      <PriceListsGrid priceLists={priceLists} loading={loading} />
      <PriceListDialog />
    </div>
  );
};

export default PriceLists;