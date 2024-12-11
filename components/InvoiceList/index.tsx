"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import InvoiceList from "./InvoiceList";

interface InvoiceListPageProps {
  onMenuItemClick: (itemName: string) => void;
}

const InvoiceListPage: React.FC<InvoiceListPageProps> = ({
  onMenuItemClick,
}) => {
  return (
    <div className="grid-container">
      <Card className="mt-4">
        <InvoiceList onMenuItemClick={onMenuItemClick} />
      </Card>
    </div>
  );
};

export default InvoiceListPage;
