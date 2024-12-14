"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import BarcodeForm from "./BarcodeForm";
import { useBarcodeGenerator } from "./hooks/useBarcodeGenerator";

const BarcodeGenerator: React.FC = () => {
  const {
    formData,
    loading,
    error,
    isQRCodeGenerated,
    updateFormData,
    handlePrint,
  } = useBarcodeGenerator();

  return (
    <div className="grid-container">
      <Card className="p-6 max-w-md mx-auto">
        <BarcodeForm
          formData={formData}
          loading={loading}
          error={error}
          isQRCodeGenerated={isQRCodeGenerated}
          onChange={updateFormData}
          onPrint={handlePrint}
        />
      </Card>
    </div>
  );
};

export default BarcodeGenerator;
