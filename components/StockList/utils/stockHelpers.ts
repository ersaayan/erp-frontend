import { StockCard } from '../types';

export const calculateTotalQuantity = (rowData: StockCard): number => {
    return rowData.stockCardWarehouse.reduce((total, warehouse) => {
        return total + parseInt(warehouse.quantity, 10);
    }, 0);
};

export const getCategoryPath = (rowData: StockCard): string => {
    if (!rowData.stockCardCategoryItem?.length) return "";

    const category = rowData.stockCardCategoryItem[0];
    if (!category.parentCategories) {
        return category.stockCardCategory.categoryName;
    }

    return category.parentCategories
        .slice()
        .reverse()
        .map((cat) => cat.categoryName)
        .join(" > ");
};

export const renderPriceWithTRY = (
    price: number,
    currency: string,
    exchangeRates: { USD_TRY: number; EUR_TRY: number } | null
): string => {
    if (!exchangeRates || currency === "TRY") {
        return price.toFixed(2);
    }

    const rate = currency === "USD" ? exchangeRates.USD_TRY : exchangeRates.EUR_TRY;
    const tryPrice = price * rate;
    return `${price.toFixed(2)} (₺${tryPrice.toFixed(2)})`;
};