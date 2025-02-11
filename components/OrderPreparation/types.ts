export interface Current {
  id: string;
  currentCode: string;
  currentName: string;
  currentType: string;
  institution: string;
  identityNo: string;
  taxNumber: string;
  taxOffice: string;
  title: string;
  name: string | null;
  surname: string | null;
  webSite: string | null;
  birthOfDate: string | null;
  kepAddress: string | null;
  mersisNo: string | null;
  sicilNo: string | null;
  priceListId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  priceList: {
    id?: string;
    priceListName: string;
    currency?: string;
    isVatIncluded?: boolean;
    vatRate?: number;
  };
  currentAddress?: Array<{
    id?: string;
    addressName?: string;
    addressType?: string;
    address?: string;
    countryCode?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    phone?: string;
    phone2?: string;
    email?: string;
    email2?: string;
  }>;
  currentFinancial?: Array<{
    id?: string;
    bankName?: string;
    branchName?: string;
    bankBranch?: string;
    bankBranchCode?: string;
    accountNo?: string;
    iban?: string;
  }>;
  currentRisk?: Array<{
    id?: string;
    currency?: string;
    teminatYerelTutar?: string;
    acikHesapYerelLimit?: string;
    hesapKesimGunu?: number;
    vadeGun?: number;
    gecikmeLimitGunu?: number;
    varsayilanAlisIskontosu?: string;
    varsayilanSatisIskontosu?: string;
    ekstreGonder?: boolean;
    limitKontrol?: boolean;
    acikHesap?: boolean;
    posKullanim?: boolean;
  }>;
  currentOfficials?: Array<{
    id?: string;
    title?: string;
    name?: string;
    surname?: string;
    phone?: string;
    email?: string;
    note?: string;
  }>;
}

export interface OrderFormData {
  current: Current | null;
  orderNo: string;
  orderDate: Date;
  deliveryDate: Date;
  branchCode: string;
  warehouseId: string;
  description: string;
}

export interface StockItem {
  id: string;
  stockId: string;
  stockCode: string;
  stockName: string;
  quantity: number;
  unit: string;
  stockLevel: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  priceListId: string;
  currency: string;
  isVatIncluded: boolean;
}

export interface Branch {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface Warehouse {
  id: string;
  warehouseName: string;
  warehouseCode: string;
}

export interface FormSectionProps {
  title: string;
  description?: string;
  isValid?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}
