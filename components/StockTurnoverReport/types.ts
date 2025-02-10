export interface StockTurnoverReport {
  productCode: string;
  productName: string;
  currentStock: number;
  last90DaysOutQuantity: number;
  last30DaysOutQuantity: number;
  last7DaysOutQuantity: number;
  averageDailyOutQuantity: number;
  turnoverRate: number;
  isBelowCriticalLevel: boolean;
  criticalLevel: number | null;
  warehouseDetails: WarehouseDetail[];
  movementAnalysis: MovementAnalysis;
  periodComparison: PeriodComparison;
}

interface WarehouseDetail {
  warehouseName: string;
  currentStock: number;
  last30DaysOutQuantity: number;
}

interface MovementAnalysis {
  trend: "active" | "inactive";
  velocityChange: number;
  stockSufficiency: number;
}

interface PeriodComparison {
  previousPeriodOut: number;
  changePercentage: number;
}

export interface StockTurnoverReportParams {
  startDate?: Date;
  endDate?: Date;
  warehouseId?: string;
  productCode?: string;
  productName?: string;
  searchQuery?: string;
  sortBy?: "turnoverRate" | "currentStock" | "last30DaysOutQuantity";
  sortDirection?: "asc" | "desc";
}

export interface StockTurnoverReportResponse {
  success: boolean;
  data: StockTurnoverReport[];
  message: string;
}
