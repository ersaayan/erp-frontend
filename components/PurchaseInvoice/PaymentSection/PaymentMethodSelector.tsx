import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PaymentDetails } from "./types";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentDetails["type"] | null;
  onMethodSelect: (method: PaymentDetails["type"]) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={selectedMethod === "cash" ? "default" : "outline"}
          onClick={() => onMethodSelect("cash")}
          className="flex-1"
        >
          Nakit
        </Button>
        <Button
          variant={selectedMethod === "card" ? "default" : "outline"}
          onClick={() => onMethodSelect("card")}
          className="flex-1"
        >
          Kredi Kartı
        </Button>
        <Button
          variant={selectedMethod === "transfer" ? "default" : "outline"}
          onClick={() => onMethodSelect("transfer")}
          className="flex-1"
        >
          Havale/EFT
        </Button>
        <Button
          variant={selectedMethod === "credit" ? "default" : "outline"}
          onClick={() => onMethodSelect("credit")}
          className="flex-1"
        >
          Açık Hesap
        </Button>
      </div>

      {!selectedMethod && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Lütfen bir ödeme yöntemi seçiniz</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
