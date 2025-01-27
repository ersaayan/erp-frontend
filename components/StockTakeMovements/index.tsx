import { useCallback, useEffect, useMemo, useState } from "react";
import { StockTakeMovement, StockTakeStatus, StockTakeType } from "./types";
import MovementsGrid from "./MovementsGrid";
import MovementsToolbar from "./MovementsToolbar";
import { useToast } from "@/hooks/use-toast";

const StockTakeMovements = () => {
  const [movements, setMovements] = useState<StockTakeMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockTakeStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<StockTakeType | "">("");
  const { toast } = useToast();

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/warehouses/stocktake`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setMovements(data);
    } catch (error) {
      console.error("Stok sayım hareketleri yüklenirken hata oluştu:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Stok sayım hareketleri yüklenirken hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const matchesSearch =
        !searchTerm ||
        movement.documentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || movement.status === statusFilter;
      const matchesType = !typeFilter || movement.stockTakeType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [movements, searchTerm, statusFilter, typeFilter]);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <MovementsToolbar
        onRefresh={fetchMovements}
        onSearch={setSearchTerm}
        onFilterStatus={setStatusFilter}
        onFilterType={setTypeFilter}
      />
      <MovementsGrid data={filteredMovements} loading={loading} />
    </div>
  );
};

export default StockTakeMovements;
