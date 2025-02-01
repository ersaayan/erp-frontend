export interface StockBalanceReportParams {
    productCode?: string;
    startDate?: string;
    endDate?: string;
}

export interface StockBalanceReportItem {
    productCode: string;
    productName: string;
    warehouseName: string;
    inQuantity: number;
    outQuantity: number;
    currentStock: number;
    criticalStock: number;
}

export interface StockBalanceReportError {
    error: string;
    details?: string;
} 