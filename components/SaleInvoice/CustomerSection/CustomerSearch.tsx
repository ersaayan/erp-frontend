"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { Current } from "@/components/CurrentList/types";

interface CustomerSearchProps {
  onCustomerSelect: (customer: Current) => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({ onCustomerSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Current[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  const searchCustomers = useCallback(async () => {
    if (!debouncedSearchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/currents/search?query=${debouncedSearchTerm}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Customer search failed");
      }

      const data = await response.json();
      setResults(data);
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

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Tedarikçi Ara..."
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
                onClick={() => onCustomerSelect(customer)}
              >
                <div>
                  <div className="font-medium">{customer.currentName}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.currentCode}
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

export default CustomerSearch;