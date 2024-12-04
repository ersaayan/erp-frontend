import React from "react";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { Current } from "../CurrentList/types";

interface PurchaseInvoiceHeaderProps {
  current: Current | null;
}

const PurchaseInvoiceHeader: React.FC<PurchaseInvoiceHeaderProps> = ({
  current,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Alış Faturası</h2>
        <p className="text-muted-foreground">{current?.currentName}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <X className="h-4 w-4 mr-2" />
          İptal
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-[#84CC16] hover:bg-[#65A30D]"
        >
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
      </div>
    </div>
  );
};

export default PurchaseInvoiceHeader;
