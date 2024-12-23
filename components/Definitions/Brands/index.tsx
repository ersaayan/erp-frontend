"use client";

import React, { useState, useEffect } from "react";
import BrandsGrid from "./BrandsGrid";
import BrandDialog from "./BrandDialog";
import BrandsToolbar from "./BrandsToolbar";
import { useBrandDialog } from "./useBrandDialog";
import { Brand } from "./types";

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen } = useBrandDialog();

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/brands`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();

    const handleRefresh = () => {
      fetchBrands();
    };

    window.addEventListener("refreshBrands", handleRefresh);
    return () => {
      window.removeEventListener("refreshBrands", handleRefresh);
    };
  }, []);

  return (
    <div className="space-y-4">
      <BrandsToolbar />
      <BrandsGrid brands={brands} loading={loading} />
      <BrandDialog />
    </div>
  );
};

export default Brands;