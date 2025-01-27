"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface StockSearchResult {
  id: string;
  productCode: string;
  productName: string;
}

interface StockSearchComboboxProps {
  onSelect: (stockId: string) => void;
}

export function StockSearchCombobox({ onSelect }: StockSearchComboboxProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<StockSearchResult[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  React.useEffect(() => {
    const searchStockCards = async () => {
      if (!debouncedSearchTerm) {
        setSearchResults([]);
        setSearchOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.BASE_URL}/stockcards/search?query=${debouncedSearchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stock cards");
        }

        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : []);
        setSearchOpen(true);
      } catch (error) {
        console.error("Error searching stock cards:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchStockCards();
  }, [debouncedSearchTerm]);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Stok kartı ara..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSearchOpen(true);
          }}
          className="w-full"
        />
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute w-full bg-background border rounded-lg mt-1 shadow-lg z-50 max-h-[300px] overflow-auto">
            {searchResults.map((stock) => (
              <div
                key={stock.id}
                className="p-2 hover:bg-accent cursor-pointer flex items-center space-x-2"
                onClick={() => {
                  onSelect(stock.id);
                  setSearchOpen(false);
                  setSearchTerm("");
                }}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{stock.productName}</div>
                  <div className="text-sm text-muted-foreground">
                    {stock.productCode}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
