export type ReceiptType = "Giris" | "Cikis";

export interface Receipt {
  data: Array<{
    id: string;
    documentNo: string;
    receiptType: ReceiptType;
    description: string | null;
    branchCode: string;
    createdAt: Date;
    current: {
      id: string;
      currentCode: string;
      currentName: string;
    } | null;
    receiptDetail?: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      stockCard: {
        id: string;
        productName: string;
        productCode: string;
      };
    }>;
    createdByUser: {
      id: string;
      username: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReceiptDetailType {
  id: string;
  documentNo: string;
  receiptType: ReceiptType;
  description: string | null;
  branchCode: string;
  createdAt: Date;
  outWarehouse: {
    id: string;
    warehouseCode: string;
    warehouseName: string;
  } | null;
  inWarehouse: {
    id: string;
    warehouseCode: string;
    warehouseName: string;
  } | null;
  current: {
    id: string;
    currentCode: string;
    currentName: string;
    priceList: {
      id: string;
      priceListName: string;
      currency: string;
      isVatIncluded: boolean;
    };
  } | null;
  receiptDetail: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    vatRate: number;
    discount: number;
    netPrice: number;
    stockCard: {
      id: string;
      productName: string;
      productCode: string;
      unit: string;
    };
  }>;
  currentMovement: {
    id: string;
    documentType: string | null;
    movementType: string;
    debtAmount: number | null;
    creditAmount: number | null;
    description: string | null;
  } | null;
  createdByUser: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}
