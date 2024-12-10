"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wallet, CreditCard, Building2, FileText } from "lucide-react";
import { PaymentMethod } from "./types";

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "cash", name: "Nakit", icon: Wallet },
  { id: "card", name: "Kredi Kartı", icon: CreditCard },
  { id: "bank", name: "Havale/EFT", icon: Building2 },
  { id: "openAccount", name: "Açık Hesap", icon: FileText },
];

interface PaymentMethodSelectProps {
  selectedMethod: string | null;
  onMethodSelect: (method: string) => void;
}

const PaymentMethodSelect: React.FC<PaymentMethodSelectProps> = ({
  selectedMethod,
  onMethodSelect,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        return (
          <Button
            key={method.id}
            variant="outline"
            className={cn(
              "flex flex-col h-auto gap-1 p-4",
              selectedMethod === method.id &&
                "border-primary bg-primary/5 text-primary"
            )}
            onClick={() => onMethodSelect(method.id)}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{method.name}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelect;
