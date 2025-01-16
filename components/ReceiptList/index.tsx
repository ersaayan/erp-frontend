"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import ReceiptListGrid from "./ReceiptListGrid";

const ReceiptList: React.FC = () => {
  return (
    <div className="grid-container">
      <Card className="mt-4">
        <ReceiptListGrid />
      </Card>
    </div>
  );
};

export default ReceiptList;
