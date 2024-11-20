"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import WarehousesToolbar from "./WarehousesToolbar";
import WarehousesGrid from "./WarehousesGrid";
import WarehouseDialog from "./WarehouseDialog";

const Warehouses: React.FC = () => {
  return (
    <div className="grid-container">
      <WarehousesToolbar />
      <Card className="mt-4">
        <WarehousesGrid />
      </Card>
      <WarehouseDialog />
    </div>
  );
};

export default Warehouses;
