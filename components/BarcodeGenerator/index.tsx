"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import BarcodeForm from "./BarcodeForm";
import { useBarcodeGenerator } from "./hooks/useBarcodeGenerator";

const BarcodeGenerator: React.FC = () => {
  const {
    formData,
    previewData,
    loading,
    error,
    isQRCodeGenerated,
    updateFormData,
    handlePrint,
  } = useBarcodeGenerator();

  return (
    <div className="grid-container">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card className="p-6">
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
    </div>
  );
};

export default BarcodeGenerator;
