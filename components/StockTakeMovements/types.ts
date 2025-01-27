export type StockTakeStatus = 'Completed' | 'InProgress' | 'Cancelled';
export type StockTakeType = 'Full' | 'Partial';

export interface StockTakeMovement {
    id: string;
    documentNo: string;
    warehouseId: string;
    branchCode: string;
    stockTakeType: StockTakeType;
    status: StockTakeStatus;
    description: string | null;
    reference: string | null;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
} 