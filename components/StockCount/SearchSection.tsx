"use client";

import React, { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useProductSearch } from "./hooks/useProductSearch";
import { CountedProduct } from "./types";

interface SearchSectionProps {
  warehouseId: string;
  onProductAdd: (product: CountedProduct) => void;
  disabled?: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  warehouseId,
  onProductAdd,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { searchProduct, loading } = useProductSearch(warehouseId);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    const result = await searchProduct(searchTerm);
    if (result) {
      onProductAdd({
        id: result.id,
        productName: result.productName,
        productCode: result.productCode,
        quantity: 1,
      });
      setSearchTerm("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          placeholder={disabled ? "Önce depo seçin" : "Ürün ara..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          className="pr-10"
        />
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
      <Button
        onClick={handleSearch}
        disabled={disabled || loading || !searchTerm.trim()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default SearchSection;
