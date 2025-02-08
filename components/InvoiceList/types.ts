export interface Invoice {
  id: string;
  invoiceNo: string;
  gibInvoiceNo: string | null;
  invoiceDate: string;
  invoiceType: "Sales" | "Purchase" | "Return" | "Cancel";
  documentType: "Invoice" | "Order" | "Waybill";
  currentCode: string;
  companyCode: string;
  branchCode: string;
  outBranchCode: string | null;
  warehouseCode: string;
  description: string;
  genelIskontoTutar: string | null;
  genelIskontoOran: string | null;
  paymentDate: string;
  paymentDay: number;
  priceListId: string;
  totalAmount: string;
  totalVat: string;
  totalDiscount: string;
  totalNet: string;
  totalPaid: string;
  totalDebt: string;
  totalBalance: string;
  createdAt: string;
  updatedAt: string;
  canceledAt: string | null;
  createdBy: string;
  updatedBy: string;
  current: {
    currentCode: string;
    currentName: string;
  };
  branch: {
    branchCode: string;
    branchName: string;
  };
  warehouse: {
    warehouseCode: string;
    warehouseName: string;
  };
  createdByUser: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FilterParams {
  page?: number;
  limit?: number;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
  filter?: {
    invoiceType?: string;
    documentType?: string;
    startDate?: string;
    endDate?: string;
    currentCode?: string;
    currentName?: string;
    branchCode?: string;
  };
}

export interface InvoiceListProps {
  onMenuItemClick: (itemName: string) => void;
}
