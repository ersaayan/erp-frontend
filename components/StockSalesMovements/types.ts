export interface StockMovement {
    id: string;
    productCode: string;
    warehouseCode: string;
    branchCode: string;
    currentCode: string;
    documentType: 'Invoice' | 'Order' | 'Waybill' | 'Other';
    invoiceType: 'Sales' | 'Purchase' | 'Return' | 'Other';
    movementType: string;
    documentNo: string | null;
    gcCode: string | null;
    type: string | null;
    description: string;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
    unitOfMeasure: string;
    outWarehouseCode: string | null;
    priceListId: string | null;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string;
    updatedBy: string | null;
}