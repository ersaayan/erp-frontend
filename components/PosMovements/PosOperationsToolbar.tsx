"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { Pos } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PosOperationsToolbarProps {
  onShowAllMovements: () => void;
  onPosSelect: (pos: Pos | null) => void;
  selectedPos: Pos | null;
}

const PosOperationsToolbar: React.FC<PosOperationsToolbarProps> = ({
  onShowAllMovements,
  onPosSelect,
  selectedPos,
}) => {
  const [posList, setPosList] = useState<Pos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosList = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.BASE_URL}/pos`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch POS devices");
        }
        const data = await response.json();
        setPosList(data);
      } catch (error) {
        console.error("POS listesi alınırken hata oluştu:", error);
        toast.error("POS listesi alınamadı");
      } finally {
        setLoading(false);
      }
    };

    fetchPosList();
  }, []);

  const handlePosChange = (value: string) => {
    if (value === "") {
      onPosSelect(null);
      return;
    }
    const selectedPos = posList.find((pos) => pos.id === value);
    if (selectedPos) {
      onPosSelect(selectedPos);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end items-center gap-2">
        <Select
          value={selectedPos?.id || ""}
          onValueChange={handlePosChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue
              placeholder={loading ? "Yükleniyor..." : "POS Seçiniz..."}
            />
          </SelectTrigger>
          <SelectContent>
            {posList.map((pos) => (
              <SelectItem key={pos.id} value={pos.id}>
                {pos.posName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="default"
          size="sm"
          onClick={onShowAllMovements}
          className="bg-[#84CC16] hover:bg-[#65A30D]"
        >
          <List className="h-4 w-4 mr-2" />
          Tüm Hareketler
        </Button>
      </div>
    </div>
  );
};

export default PosOperationsToolbar;
