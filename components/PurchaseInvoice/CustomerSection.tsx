import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { Current } from "../CurrentList/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useCustomerSearch } from "./hooks/useCustomerSearch";
import { Card } from "../ui/card";

interface CustomerSectionProps {
  customer: Current | null;
  onCustomerSelect: (customer: Current | null) => void;
  autoOpenSearch?: boolean;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
  customer,
  onCustomerSelect,
  autoOpenSearch = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { results, loading, searchCustomers } = useCustomerSearch();
  const [showSearch, setShowSearch] = useState(!customer || autoOpenSearch);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
      searchCustomers(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchCustomers]);

  useEffect(() => {
    // Automatically show search on initial load if autoOpenSearch is true
    if (autoOpenSearch && !customer) {
      setShowSearch(true);
      // Load initial customer list without search term
      searchCustomers("");
    }
  }, [autoOpenSearch, customer, searchCustomers]);

  const handleClearCustomer = () => {
    onCustomerSelect(null);
    setShowSearch(true);
    setSearchTerm("");
    // Load full customer list when clearing
    searchCustomers("");
  };

  const handleSelectCustomer = (selected: Current) => {
    onCustomerSelect(selected);
    setShowSearch(false);
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cari Bilgileri</h3>
        {customer && !showSearch && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowSearch(true);
              searchCustomers("");
            }}
          >
            Cari Değiştir
          </Button>
        )}
      </div>

      {!customer || showSearch ? (
        <>
          <div className="relative">
            <Input
              placeholder="Cari Ara..."
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
            <ScrollArea className="h-[300px] rounded-md border">
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
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <Label className="text-muted-foreground">Cari Adı</Label>
                <div className="font-medium text-lg">
                  {customer.currentName}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Cari Kodu</Label>
                <div className="font-medium">{customer.currentCode}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <Label className="text-muted-foreground">Vergi No / TC</Label>
                <div className="font-medium">
                  {customer.taxNumber || customer.identityNo || "-"}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Tanımlı Fiyat Listesi
                </Label>
                <div className="font-medium">
                  {customer.priceList?.priceListName || "-"}
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleClearCustomer}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CustomerSection;
