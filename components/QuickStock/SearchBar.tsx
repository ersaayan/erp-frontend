"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Stock } from "./types";
import { mockStocks } from "./data";

interface SearchBarProps {
  onStockSelect: (stock: Stock) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onStockSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOptions, setSearchOptions] = useState({
    barcodeOnly: false,
    stockCodeOnly: false,
    stockNameOnly: false,
    searchInBarcodes: false,
    searchInCodes: false,
    searchInXXL: false,
  });

  const handleSearch = () => {
    // Mock search functionality
    const foundStock = mockStocks.find(
      (stock) =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.barcode.includes(searchTerm)
    );

    if (foundStock) {
      onStockSelect(foundStock);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="20 Adet Stok İçinde Ara"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button variant="default" size="icon" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            Arama Seçenekleri
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Arama Seçenekleri</h4>
              <p className="text-sm text-muted-foreground">
                Arama yapmak istediğiniz alanları seçin
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="barcodeOnly"
                  checked={searchOptions.barcodeOnly}
                  onCheckedChange={(checked) =>
                    setSearchOptions((prev) => ({
                      ...prev,
                      barcodeOnly: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="barcodeOnly">Sadece Barkodda Ara</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stockCodeOnly"
                  checked={searchOptions.stockCodeOnly}
                  onCheckedChange={(checked) =>
                    setSearchOptions((prev) => ({
                      ...prev,
                      stockCodeOnly: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="stockCodeOnly">Sadece Stok Kodunda Ara</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stockNameOnly"
                  checked={searchOptions.stockNameOnly}
                  onCheckedChange={(checked) =>
                    setSearchOptions((prev) => ({
                      ...prev,
                      stockNameOnly: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="stockNameOnly">Sadece Stok Adında Ara</Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchBar;
