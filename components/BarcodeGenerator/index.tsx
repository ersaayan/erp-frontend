"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import BarcodeForm from "./BarcodeForm";
import BarcodePreview from "./BarcodePreview";
import { useBarcodeGenerator } from "./hooks/useBarcodeGenerator";

const BarcodeGenerator: React.FC = () => {
  const {
    formData,
    previewData,
    loading,
    error,
    updateFormData,
    handlePrint,
    validateForm,
  } = useBarcodeGenerator();

  return (
    <div className="grid-container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <BarcodeForm
            formData={formData}
            loading={loading}
            error={error}
            onSubmit={validateForm}
            onChange={updateFormData}
            onPrint={handlePrint}
          />
        </Card>

        <Card className="p-6">
          <BarcodePreview data={previewData} />
        </Card>
      </div>
    </div>
  );
};

export default BarcodeGenerator;
