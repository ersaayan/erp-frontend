import { Current } from "@/components/CurrentList/types";

interface PriceList {
    id: string;
    priceListName: string;
    currency: string;
    isVatIncluded: boolean;
}

interface ProductPriceList {
    id: string;
    priceListId: string;
    price: string;
    vatRate: string | null;
    priceList: PriceList;
}

interface Product {
    id: string;
    productCode: string;
    productName: string;
    unit: string;
    stockCardPriceLists: ProductPriceList[];
}

interface ProcessedProduct {
    id: string;
    productCode: string;
    productName: string;
    unit: string;
    price: number;
    vatRate: number;
    priceListId: string;
    currency: string;
}

export const getProductPrice = (
    product: Product,
    customer: Current | null
): ProcessedProduct => {
    try {
        // Default values
        let price = 0;
        let vatRate = 0;
        let priceListId = "";
        let currency = "TRY";

        if (customer?.priceListId && product.stockCardPriceLists?.length > 0) {
            // Find matching price list
            const matchingPriceList = product.stockCardPriceLists.find(
                (pl) => pl.priceListId === customer.priceListId
            );

            if (matchingPriceList) {
                price = parseFloat(matchingPriceList.price || "0");
                vatRate = parseFloat(matchingPriceList.vatRate || "0");
                priceListId = matchingPriceList.priceListId;
                currency = matchingPriceList.priceList.currency;
            } else {
                // If no matching price list, try to use the first available price list
                const defaultPriceList = product.stockCardPriceLists[0];
                price = parseFloat(defaultPriceList.price || "0");
                vatRate = parseFloat(defaultPriceList.vatRate || "0");
                priceListId = defaultPriceList.priceListId;
                currency = defaultPriceList.priceList.currency;
            }
        }

        return {
            id: product.id,
            productCode: product.productCode,
            productName: product.productName,
            unit: product.unit,
            price,
            vatRate,
            priceListId,
            currency,
        };
    } catch (error) {
        console.error("Error processing product price:", error);
        // Return default values if there's an error
        return {
            id: product.id,
            productCode: product.productCode,
            productName: product.productName,
            unit: product.unit,
            price: 0,
            vatRate: 0,
            priceListId: "",
            currency: "TRY",
        };
    }
};

export const processProductsWithPricing = (
    products: Product[],
    customer: Current | null
): ProcessedProduct[] => {
    try {
        return products.map((product) => getProductPrice(product, customer));
    } catch (error) {
        console.error("Error processing products:", error);
        return [];
    }
};