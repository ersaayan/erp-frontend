"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Stock } from "./types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useDebounce } from "./hooks/use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchBarProps {
  onStockSelect: (stock: Stock) => void;
}

type SearchOption = "barcodeOnly" | "stockCodeOnly" | "stockNameOnly" | null;

const SearchBar: React.FC<SearchBarProps> = ({ onStockSelect }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Stock[]>([]);
  const [selectedOption, setSelectedOption] = useState<SearchOption>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleSearch = useCallback(async () => {
    try {
      if (!debouncedSearchTerm.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);

      const searchParams = new URLSearchParams();
      if (selectedOption === "barcodeOnly")
        searchParams.append("barcodes", debouncedSearchTerm);
      else if (selectedOption === "stockCodeOnly")
        searchParams.append("productCode", debouncedSearchTerm);
      else if (selectedOption === "stockNameOnly")
        searchParams.append("productName", debouncedSearchTerm);
      else searchParams.append("query", debouncedSearchTerm);

      const response = await fetch(
        `${process.env.BASE_URL}/stockcards/search?${searchParams}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Stock search failed");
      }

      const data = await response.json();

      if (data.length === 0) {
        toast({
          title: "No Results",
          description: "No stocks found matching your search criteria",
        });
        setResults([]);
        return;
      }

      const transformedResults: Stock[] = data.map((item: any) => ({
        id: item.id,
        name: item.productName,
        code: item.productCode,
        barcode: item.barcodes[0]?.barcode || "",
        salePrice: parseFloat(item.stockCardPriceLists[0]?.price || "0"),
        salePriceWithTax:
          parseFloat(item.stockCardPriceLists[0]?.price || "0") *
          (1 + parseFloat(item.stockCardPriceLists[0]?.vatRate || "0") / 100),
        currency: item.stockCardPriceLists[0]?.priceList.currency || "TRY",
        currentQuantity: parseInt(item.stockCardWarehouse[0]?.quantity || "0"),
        unit: item.unit,
        shortDescription: item.shortDescription,
        description: item.description,
        brand: item.brand?.brandName || "",
        vatRate: parseFloat(item.stockCardPriceLists[0]?.vatRate || "0"),
        warehouseName:
          item.stockCardWarehouse[0]?.warehouse.warehouseName || "",
        prices: item.stockCardPriceLists.map((priceList: any) => ({
          id: priceList.id,
          priceListName: priceList.priceList.priceListName,
          price: parseFloat(priceList.price),
          currency: priceList.priceList.currency,
          vatRate: priceList.vatRate
            ? parseFloat(priceList.vatRate)
            : undefined,
        })),
      }));

      setResults(transformedResults);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedOption, toast]);

  React.useEffect(() => {
    handleSearch();
  }, [debouncedSearchTerm, handleSearch]);

  const handleResultClick = (stock: Stock) => {
    onStockSelect(stock);
    setResults([]);
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Stok Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          className="pr-10"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <RadioGroup
        value={selectedOption || ""}
        onValueChange={(value) => setSelectedOption(value as SearchOption)}
        className="grid grid-cols-2 gap-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="" id="general" />
          <Label htmlFor="general">Genel Arama</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="barcodeOnly" id="barcode" />
          <Label htmlFor="barcode">Barkod ile Ara</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="stockCodeOnly" id="stockCode" />
          <Label htmlFor="stockCode">Stok Kodu ile Ara</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="stockNameOnly" id="stockName" />
          <Label htmlFor="stockName">Stok Adı ile Ara</Label>
        </div>
      </RadioGroup>

      {results.length > 0 && (
        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-4">
            {results.map((stock) => (
              <Button
                key={stock.id}
                variant="ghost"
                className="w-full justify-start text-left mb-2"
                onClick={() => handleResultClick(stock)}
              >
                <div>
                  <div className="font-medium">{stock.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {stock.code} - {stock.barcode}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default SearchBar;
