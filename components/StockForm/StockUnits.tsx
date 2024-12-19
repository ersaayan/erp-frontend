import React from "react";
import { Card, CardContent } from "../ui/card";
import { StockUnitsGrid } from "./StockUnitsGrid";
import { ErrorBoundary } from "./ErrorBoundary";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { StockUnit } from "./types";

interface StockUnitsProps {
  units: StockUnit[];
  setUnits: React.Dispatch<React.SetStateAction<StockUnit[]>>;
}

const ErrorFallback = () => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>Bileşen yüklenirken bir hata oluştu.</AlertDescription>
  </Alert>
);

const StockUnits: React.FC<StockUnitsProps> = ({ units, setUnits }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <ErrorBoundary fallback={<ErrorFallback />}>
          <StockUnitsGrid units={units} setUnits={setUnits} />
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
};

export default StockUnits;
