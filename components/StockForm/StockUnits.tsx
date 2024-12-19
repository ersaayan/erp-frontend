import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { StockUnit } from "./types";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "./ErrorBoundary";
// Separate DataGrid component
const StockUnitsGrid = dynamic(
  () => import("./StockUnitsGrid"), // Create this component separately
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

interface StockUnitsProps {
  units: StockUnit[];
  setUnits: React.Dispatch<React.SetStateAction<StockUnit[]>>;
}

export default function StockUnits({ units, setUnits }: StockUnitsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <ErrorBoundary
          fallback={
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bileşen yüklenirken bir hata oluştu.
              </AlertDescription>
            </Alert>
          }
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <StockUnitsGrid units={units} setUnits={setUnits} />
          </Suspense>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}
