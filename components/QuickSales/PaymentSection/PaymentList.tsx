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

interface PaymentListProps {
  payments: PaymentDetails[];
  onDelete: (id: string) => void;
}

const PaymentList: React.FC<PaymentListProps> = ({ payments, onDelete }) => {
  if (payments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Henüz ödeme eklenmedi
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Yöntem</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {payment.method === "cash"
                  ? "Nakit"
                  : payment.method === "card"
                    ? "Kredi Kartı"
                    : payment.method === "bank"
                      ? "Havale/EFT"
                      : "Açık Hesap"}
              </TableCell>
              <TableCell className="text-right">
                {payment.amount.toFixed(2)} {payment.currency}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(payment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentList;
