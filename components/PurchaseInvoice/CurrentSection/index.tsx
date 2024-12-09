"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building2, MapPin, Banknote, Wallet } from "lucide-react";
import { Current } from "@/components/CurrentList/types";
import { useDebounce } from "@/hooks/use-debounce";

interface CurrentSectionProps {
  currentData: Current | null;
  onCurrentChange: (current: Current | null) => void;
}

const CurrentSection: React.FC<CurrentSectionProps> = ({
  currentData,
  onCurrentChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Current[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.BASE_URL}/currents/search?query=${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching currents:", error);
      setSearchResults([]);
    }
  };

  React.useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {currentData ? (
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  {currentData.currentName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentData.currentCode}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span>{currentData.priceList.priceListName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <span>{currentData.priceList.currency}</span>
                </div>
                {currentData.currentAddress?.[0] && (
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{currentData.currentAddress[0].address}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                onCurrentChange(null);
                setSearchTerm("");
              }}
            >
              Cari Değiştir
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Cari ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>

            {searchResults.length > 0 && (
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-4">
                  {searchResults.map((current) => (
                    <Button
                      key={current.id}
                      variant="ghost"
                      className="w-full justify-start text-left mb-2"
                      onClick={() => {
                        onCurrentChange(current);
                        setSearchTerm("");
                        setSearchResults([]);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {current.currentName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {current.currentCode} - {current.title}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CurrentSection;
