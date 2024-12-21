"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import GeneralInfo from "./GeneralInfo";
import CategorySection from "./CategorySection";
import AddressInfo from "./AddressInfo";
import { useCurrentForm } from "./hooks/useCurrentForm";

const CurrentForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { formData, loading, updateFormData, handleSubmit, isEditMode } =
    useCurrentForm();

  return (
    <div className="flex flex-col h-auto">
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-2xl font-bold">Cari Formu</h2>
        <div className="flex space-x-2">
          <Button
            variant="default"
            className="bg-[#84CC16] hover:bg-[#65A30D]"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isEditMode ? "GÜNCELLE" : "KAYDET"}
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="address">Adres Bilgileri</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralInfo formData={formData} updateFormData={updateFormData} />
          </TabsContent>

          <TabsContent value="categories">
            <CategorySection
              formData={formData}
              updateFormData={updateFormData}
            />
          </TabsContent>

          <TabsContent value="address">
            <AddressInfo formData={formData} updateFormData={updateFormData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CurrentForm;
