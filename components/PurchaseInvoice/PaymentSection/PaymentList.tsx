"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { PaymentDetails } from "./types";
import { formatCurrency } from "@/lib/utils";

interface PaymentListProps {
  payments: PaymentDetails[];
  onRemovePayment: (paymentId: string) => void;
}

const getMethodLabel = (method: PaymentDetails["method"]) => {
  switch (method) {
    case "cash":
      return "Nakit";
    case "card":
      return "Kredi Kartı";
    case "wire":
      return "Havale/EFT";
    case "openAccount":
      return "Açık Hesap";
    default:
      return method;
  }
};

const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  onRemovePayment,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Ödeme Listesi</h4>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ödeme Yöntemi</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Henüz ödeme eklenmedi
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{getMethodLabel(payment.method)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemovePayment(payment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentList;
