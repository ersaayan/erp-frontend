"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Current } from "../CurrentList/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useCustomerSearch } from "./hooks/useCustomerSearch";

interface CustomerSectionProps {
  customer: Current | null;
  onCustomerSelect: (customer: Current | null) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
  customer,
  onCustomerSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { results, loading, searchCustomers } = useCustomerSearch();
  const [showSearch, setShowSearch] = useState(!customer);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
      searchCustomers(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchCustomers]);

  const handleClearCustomer = () => {
    onCustomerSelect(null);
    setShowSearch(true);
    setSearchTerm("");
  };

  const handleSelectCustomer = (selected: Current) => {
    onCustomerSelect(selected);
    setShowSearch(false);
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cari</h3>
        {customer && !showSearch && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(true)}
          >
            Cari Değiştir
          </Button>
        )}
      </div>

      {!customer || showSearch ? (
        <>
          <div className="relative">
            <Input
              placeholder="Cari Ara... (min. 3 karakter)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search
              className={`absolute right-3 top-3 h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </div>

          {results.length > 0 && (
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4">
                {results.map((result) => (
                  <Button
                    key={result.id}
                    variant="ghost"
                    className="w-full justify-start text-left mb-2"
                    onClick={() => handleSelectCustomer(result)}
                  >
                    <div>
                      <div className="font-medium">{result.currentName}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.currentCode}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      ) : (
        <div className="rounded-lg border p-4 relative">
          <div className="space-y-2">
            <div>
              <Label className="text-muted-foreground">Cari Adı</Label>
              <div className="font-medium">{customer.currentName}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Cari Kodu</Label>
              <div className="font-medium">{customer.currentCode}</div>
            </div>
            {customer.taxNumber && (
              <div>
                <Label className="text-muted-foreground">
                  Tanımlı Fiyat Listesi
                </Label>
                <div className="font-medium">
                  {customer.priceList?.priceListName}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSection;
