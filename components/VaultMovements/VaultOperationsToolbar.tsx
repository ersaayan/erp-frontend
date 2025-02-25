"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { List, RefreshCw, Check, ChevronsUpDown } from "lucide-react";
import { Vault } from "./types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface VaultOperationsToolbarProps {
  onShowAllMovements: () => void;
  selectedVault: Vault | null;
  onVaultSelect: (vault: Vault) => void;
}

const VaultOperationsToolbar: React.FC<VaultOperationsToolbarProps> = ({
  onShowAllMovements,
  selectedVault,
  onVaultSelect,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVaults = vaults.filter((vault) =>
    vault.vaultName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/vaults`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch vaults");
        }
        const data = await response.json();
        setVaults(data);
      } catch (error) {
        console.error("Error fetching vaults:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Kasalar yüklenirken bir hata oluştu.",
        });
      }
    };

    fetchVaults();
  }, [toast]);

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("refreshVaultOperations"));

    toast({
      title: "Success",
      description: "Veriler başarıyla yenilendi",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center h-10">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="default"
            onClick={handleRefresh}
            className="min-w-[120px]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="min-w-[200px] justify-between"
              >
                {selectedVault ? selectedVault.vaultName : "Kasa Seçin..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <div className="flex flex-col">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Kasa ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredVaults.length === 0 ? (
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-muted-foreground">
                      Kasa bulunamadı.
                    </div>
                  ) : (
                    filteredVaults.map((vault) => (
                      <div
                        key={vault.id}
                        className={cn(
                          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer",
                          selectedVault?.id === vault.id && "bg-accent"
                        )}
                        onClick={() => {
                          onVaultSelect(vault);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedVault?.id === vault.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {vault.vaultName}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="default"
            size="default"
            onClick={onShowAllMovements}
            className="bg-[#84CC16] hover:bg-[#65A30D] min-w-[140px]"
          >
            <List className="h-4 w-4 mr-2" />
            Tüm Hareketler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VaultOperationsToolbar;
