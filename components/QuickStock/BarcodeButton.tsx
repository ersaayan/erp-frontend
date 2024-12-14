"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useBarcodeGenerator } from "@/components/BarcodeGenerator/hooks/useBarcodeGenerator";
import { Stock } from "./types";

interface BarcodeButtonProps {
  stock: Stock | null;
}

const BarcodeButton: React.FC<BarcodeButtonProps> = ({ stock }) => {
  const { loading, handlePrint } = useBarcodeGenerator();

  const handleClick = async () => {
    if (!stock?.code) return;

    // Update form data and trigger print
    await handlePrint();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={!stock?.code || loading}
      className="min-w-[120px]"
    >
      <Printer className="h-4 w-4 mr-2" />
      {loading ? "Yazdırılıyor..." : "Barkod Yazdır"}
    </Button>
  );
};

export default BarcodeButton;
