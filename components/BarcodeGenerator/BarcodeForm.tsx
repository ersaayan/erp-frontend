"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Printer } from "lucide-react";
import { BarcodeFormData } from "./types";

interface BarcodeFormProps {
  formData: BarcodeFormData;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  onChange: (field: keyof BarcodeFormData, value: string | number) => void;
  onPrint: () => void;
}

const BarcodeForm: React.FC<BarcodeFormProps> = ({
  formData,
  loading,
  error,
  onSubmit,
  onChange,
  onPrint,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="stockCode">Stok Kodu</Label>
        <Input
          id="stockCode"
          value={formData.stockCode}
          onChange={(e) => onChange("stockCode", e.target.value)}
          placeholder="Stok kodunu giriniz"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paperWidth">Kağıt Genişliği (mm)</Label>
          <Input
            id="paperWidth"
            type="number"
            min="1"
            value={formData.paperWidth}
            onChange={(e) => onChange("paperWidth", Number(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="paperHeight">Kağıt Yüksekliği (mm)</Label>
          <Input
            id="paperHeight"
            type="number"
            min="1"
            value={formData.paperHeight}
            onChange={(e) => onChange("paperHeight", Number(e.target.value))}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        onClick={onPrint}
        disabled={loading}
        className="w-full"
      >
        <Printer className="mr-2 h-4 w-4" />
        Yazdır
      </Button>
    </form>
  );
};

export default BarcodeForm;
