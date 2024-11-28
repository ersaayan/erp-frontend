"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiList from "./ApiList";
import ApiDetails from "./ApiDetails";
import ApiComparison from "./ApiComparison";
import { apiDefinitions } from "./data";

const ApiDocumentation: React.FC = () => {
  const [selectedApi, setSelectedApi] = useState<string | null>(null);

  return (
    <div className="grid-container">
      <Card className="p-6">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">API Listesi</TabsTrigger>
            <TabsTrigger value="details">Detaylı Bilgi</TabsTrigger>
            <TabsTrigger value="comparison">Karşılaştırma</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <ApiList
              apis={apiDefinitions}
              selectedApi={selectedApi}
              onApiSelect={setSelectedApi}
            />
          </TabsContent>

          <TabsContent value="details">
            <ApiDetails
              api={apiDefinitions.find((api) => api.id === selectedApi)}
            />
          </TabsContent>

          <TabsContent value="comparison">
            <ApiComparison apis={apiDefinitions} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ApiDocumentation;
