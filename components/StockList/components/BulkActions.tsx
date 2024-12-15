import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface BulkActionsProps {
  onDelete: () => void;
  onPrint: () => void;
  printLoading: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  onDelete,
  onPrint,
  printLoading,
}) => {
  return (
    <Card className="p-4 rounded-md flex items-center">
      <div className="flex gap-2">
        <Button variant="destructive" onClick={onDelete}>
          Seçili Olanları Sil
        </Button>
        <Button variant="outline" onClick={onPrint} disabled={printLoading}>
          {printLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Barkod Yazdır
        </Button>
      </div>
    </Card>
  );
};

export default BulkActions;
