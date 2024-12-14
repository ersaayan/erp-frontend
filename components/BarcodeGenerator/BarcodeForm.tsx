"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Printer, Loader2 } from "lucide-react";
import { BarcodeFormData } from "./types";

interface BarcodeFormProps {
  formData: BarcodeFormData;
  loading: boolean;
  error: string | null;
  isQRCodeGenerated: boolean;
  onChange: (field: keyof BarcodeFormData, value: string | number) => void;
  onPrint: () => void;
}

const BarcodeForm: React.FC<BarcodeFormProps> = ({
  formData,
  loading,
  error,
  isQRCodeGenerated,
  onChange,
  onPrint,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="stockCode">Stok Kodu</Label>
        <Input
          id="stockCode"
          value={formData.stockCode}
          onChange={(e) => onChange("stockCode", e.target.value)}
          placeholder="Stok kodunu giriniz"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Kağıt Genişliği</Label>
          <Input value="80mm" disabled className="bg-muted" />
        </div>

        <div>
          <Label>Kağıt Yüksekliği</Label>
          <Input value="40mm" disabled className="bg-muted" />
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
        disabled={loading || !formData.stockCode.trim() || !isQRCodeGenerated}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Printer className="mr-2 h-4 w-4" />
        )}
        {loading ? "İşleniyor..." : "Yazdır"}
      </Button>

      {formData.stockCode.trim() && !isQRCodeGenerated && !error && (
        <div className="text-sm text-muted-foreground text-center">
          QR kod oluşturuluyor...
        </div>
      )}
    </div>
  );
};

export default BarcodeForm;
