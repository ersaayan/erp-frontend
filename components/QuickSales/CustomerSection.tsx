"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus, X } from "lucide-react";
import { Customer } from "./types";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

interface CustomerSectionProps {
  customer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
  customer,
  onCustomerSelect,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const searchCustomers = useCallback(async () => {
    if (!debouncedSearchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/currents/search?query=${debouncedSearchTerm}`
      );

      if (!response.ok) {
        throw new Error("Customer search failed");
      }

      const data = await response.json();
      setResults(
        data.map((item: any) => ({
          id: item.id,
          name: item.currentName,
          code: item.currentCode,
          taxNumber: item.taxNumber,
          taxOffice: item.taxOffice,
          address: item.address,
          phone: item.phone,
          email: item.email,
        }))
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search customers",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, toast]);

  React.useEffect(() => {
    searchCustomers();
  }, [debouncedSearchTerm, searchCustomers]);

  const handleCustomerSelect = (selectedCustomer: Customer) => {
    onCustomerSelect(selectedCustomer);
    setSearchTerm("");
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Müşteri</h3>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Yeni Müşteri
        </Button>
      </div>

      {customer ? (
        <div className="rounded-lg border p-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => onCustomerSelect(null)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <div>
              <Label className="text-muted-foreground">Müşteri Adı</Label>
              <div className="font-medium">{customer.name}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Müşteri Kodu</Label>
              <div className="font-medium">{customer.code}</div>
            </div>
            {customer.taxNumber && (
              <div>
                <Label className="text-muted-foreground">Vergi No</Label>
                <div className="font-medium">{customer.taxNumber}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <Input
              placeholder="Müşteri Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>

          {results.length > 0 && (
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4">
                {results.map((customer) => (
                  <Button
                    key={customer.id}
                    variant="ghost"
                    className="w-full justify-start text-left mb-2"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.code}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerSection;
