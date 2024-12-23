"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import PriceLists from "./PriceLists";
import Brands from "./Brands";

const Definitions: React.FC = () => {
  return (
    <div className="grid-container">
      <Card className="p-6">
        <Tabs defaultValue="price-lists">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="price-lists">Fiyat Listeleri</TabsTrigger>
            <TabsTrigger value="brands">Markalar</TabsTrigger>
          </TabsList>

          <TabsContent value="price-lists">
            <PriceLists />
          </TabsContent>

          <TabsContent value="brands">
            <Brands />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Definitions;