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
    riskQuantities: string;
    stockStatus: boolean;
    hasExpirationDate: boolean;
    allowNegativeStock: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    Branch: {
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
    Company: {
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
    Barcodes: Array<{
        id: string;
        stockCardId: string;
        barcode: string;
    }>;
    Brand: {
        id: string;
        brandName: string;
        brandCode: string;
    };
    StockCardAttributeItems: Array<{
        id: string;
        attributeId: string;
        stockCardId: string;
        attribute: {
            id: string;
            attributeName: string;
            value: string;
        };
    }>;
    StockCardEFatura: Array<{
        id: string;
        productCode: string;
        productName: string;
        stockCardId: string;
        stockCardPriceListId: string;
    }>;
    StockCardManufacturer: Array<{
        id: string;
        productCode: string;
        productName: string;
        barcode: string;
        brandId: string;
        stockCardId: string;
        currentId: string;
    }>;
    StockCardMarketNames: Array<{
        id: string;
        stockCardId: string;
        marketName: string;
    }>;
    StockCardPriceLists: Array<{
        id: string;
        priceListId: string;
        stockCardId: string;
        price: string;
        priceList: {
            id: string;
            priceListName: string;
            currency: string;
            isVatIncluded: boolean;
            isActive: boolean;
        };
    }>;
    StockCardWarehouse: Array<{
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
    TaxRates: Array<{
        id: string;
        stockCardId: string;
        taxName: string;
        taxRate: string;
    }>;
    Categories: Array<{
        id: string;
        stockCardId: string;
        categoryId: string;
        category: {
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