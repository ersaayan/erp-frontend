import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PaymentDetails } from "./types";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface PaymentListProps {
  payments: PaymentDetails[];
  onEdit: (payment: PaymentDetails) => void;
  onDelete: (payment: PaymentDetails) => void;
  currency: string;
}

const getPaymentTypeLabel = (type: PaymentDetails["type"]): string => {
  switch (type) {
    case "cash":
      return "Nakit";
    case "card":
      return "Kredi Kartı";
    case "transfer":
      return "Havale/EFT";
    case "credit":
      return "Açık Hesap";
    default:
      return type;
  }
};

const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  onEdit,
  onDelete,
  currency,
}) => {
  if (payments.length === 0) return null;

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-2">
      <Label>Eklenen Ödemeler</Label>
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex justify-between items-center p-2 border rounded"
        >
          <div className="flex flex-col">
            <span className="font-medium">
              {payment.type === "credit"
                ? "Açık Hesap"
                : payment.accountName || getPaymentTypeLabel(payment.type)}
            </span>
            <span className="text-sm text-muted-foreground">
              {payment.description}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">
              {formatCurrency(payment.amount).replace("₺", "")} {currencySymbol}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(payment)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(payment)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentList;
