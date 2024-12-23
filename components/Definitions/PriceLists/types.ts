export interface PriceList {
  id: string;
  priceListName: string;
  currency: string;
  isVatIncluded: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}