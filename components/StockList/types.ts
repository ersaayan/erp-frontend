export interface StockCard {
  id: string;
  productCode: string;
  productName: string;
  unit: string;
  shortDescription: string;
  description: string;
  companyCode: string;
  branchCode: string;
  brandId: string;
  productType: string;
  gtip: string;
  pluCode: string;
  desi: string;
  adetBoleni: string;
  karMarji: number;
  maliyet: number;
  maliyetDoviz: string;
  siraNo: string;
  raf: string;
  riskQuantities: string;
  stockStatus: boolean;
  hasExpirationDate: boolean;
  allowNegativeStock: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  vatRate: string;
  manufacturerName: string;
  marketNames: string;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  branch: {
    id: string;
    branchName: string;
    branchCode: string;
    address: string;
    countryCode: string;
    city: string;
    district: string;
    phone: string;
    email: string;
    website: string;
    companyCode: string;
  };
  company: {
    id: string;
    companyName: string;
    name: string;
    surname: string;
    companyCode: string;
    taxNumber: string;
    taxOffice: string;
    kepAddress: string;
    mersisNo: string;
    sicilNo: string;
    address: string;
    countryCode: string;
    city: string;
    district: string;
    postalCode: string;
    phone: string;
    email: string;
    website: string;
  };
  barcodes: Array<{
    id: string;
    stockCardId: string;
    barcode: string;
  }>;
  brand: {
    id: string;
    brandName: string;
    brandCode: string;
  };
  stockCardAttributeItems: Array<{
    id: string;
    attributeId: string;
    stockCardId: string;
    attribute: {
      id: string;
      attributeName: string;
      value: string;
    };
  }>;
  stockCardEFatura: Array<{
    id: string;
    productCode: string;
    productName: string;
    stockCardId: string;
  }>;
  stockCardManufacturer: Array<{
    id: string;
    productCode: string;
    productName: string;
    barcode: string;
    brandId: string;
    stockCardId: string;
    currentId: string;
  }>;
  stockCardMarketNames: Array<{
    id: string;
    stockCardId: string;
    marketName: string;
  }>;
  stockCardPriceLists: Array<{
    id: string;
    priceListId: string;
    stockCardId: string;
    price: string;
    barcode: string;
    vatRate: string;
    priceList: {
      id: string;
      priceListName: string;
      currency: string;
      isVatIncluded: boolean;
      isActive: boolean;
    };
  }>;
  stockCardWarehouse: Array<{
    id: string;
    stockCardId: string;
    warehouseId: string;
    quantity: string;
    warehouse: {
      id: string;
      warehouseName: string;
      warehouseCode: string;
      address: string;
      countryCode: string;
      city: string;
      district: string;
      phone: string;
      email: string;
      companyCode: string;
    };
  }>;
  taxRates: Array<{
    id: string;
    stockCardId: string;
    taxName: string;
    taxRate: string;
  }>;
  stockCardCategoryItem: Array<{
    id: string;
    stockCardId: string;
    categoryId: string;
    stockCardCategory: {
      id: string;
      categoryName: string;
      categoryCode: string;
      parentCategoryId: string;
    };
    parentCategories: Array<{
      id: string;
      categoryName: string;
      categoryCode: string;
      parentCategoryId: string | null;
      parentCategory: {
        id: string;
        categoryName: string;
        categoryCode: string;
        parentCategoryId: string | null;
      } | null;
    }>;
  }>;
}

export interface PrintBarcodeItem {
  stockCard: StockCard;
  quantity: number;
}

export interface PrintBarcodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStocks: StockCard[];
  onPrint: (items: PrintBarcodeItem[]) => void;
}
