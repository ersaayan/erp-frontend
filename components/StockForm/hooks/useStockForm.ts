'use client';

import { useState, useCallback, useEffect } from 'react';
import { PriceList } from './usePriceLists';
import { StockCard } from '@/components/StockList/types';

interface StockFormState {
    stockCard: {
        productCode: string;
        productName: string;
        unit: string;
        shortDescription: string;
        description: string;
        productType: string;
        gtip: string;
        pluCode: string;
        desi: number;
        adetBoleni: number;
        siraNo: string;
        raf: string;
        karMarji: number;
        riskQuantities: number;
        stockStatus: boolean;
        hasExpirationDate: boolean;
        allowNegativeStock: boolean;
        maliyetFiyat: number;
        maliyetDoviz: string;
        brandId: string;
    };
    attributes: Array<{
        attributeId: string;
        value: string;
    }>;
    barcodes: Array<{ barcode: string }>;
    categoryItem: Array<{ categoryId: string }>;
    priceListItems: Array<{
        priceListId: string;
        price: number;
        vatRate: number | null;
        priceWithVat: number | null;
        barcode: string;
    }>;
    stockCardWarehouse: Array<{ id: string; quantity: number }>;
    eFatura: Array<{
        productCode: string;
        productName: string;
    }>;
    manufacturers: Array<{
        productCode: string;
        productName: string;
        barcode: string;
        brandId: string;
        currentId: string;
    }>;
    marketNames: Array<{ marketName: string }>;
}

const initialState: StockFormState = {
    stockCard: {
        productCode: '',
        productName: '',
        unit: '',
        shortDescription: '',
        description: '',
        productType: 'BasitUrun',
        gtip: '',
        pluCode: '',
        desi: 0,
        adetBoleni: 1,
        siraNo: '',
        raf: '',
        karMarji: 0,
        riskQuantities: 0,
        stockStatus: true,
        hasExpirationDate: false,
        allowNegativeStock: false,
        maliyetFiyat: 0,
        maliyetDoviz: 'USD',
        brandId: '',
    },
    attributes: [],
    barcodes: [],
    categoryItem: [],
    priceListItems: [],
    stockCardWarehouse: [],
    eFatura: [],
    manufacturers: [],
    marketNames: [],
};

export const useStockForm = () => {
    const [formState, setFormState] = useState<StockFormState>(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedData = localStorage.getItem('currentStockData');
        if (savedData) {
            try {
                const stockData: StockCard = JSON.parse(savedData);
                setFormState({
                    stockCard: {
                        productCode: stockData.productCode,
                        productName: stockData.productName,
                        unit: stockData.unit,
                        shortDescription: stockData.shortDescription,
                        description: stockData.description,
                        productType: stockData.productType,
                        gtip: stockData.gtip,
                        pluCode: stockData.pluCode,
                        desi: Number(stockData.desi),
                        adetBoleni: Number(stockData.adetBoleni),
                        siraNo: stockData.siraNo || '',
                        raf: stockData.raf || '',
                        karMarji: Number(stockData.karMarji),
                        riskQuantities: Number(stockData.riskQuantities),
                        stockStatus: stockData.stockStatus,
                        hasExpirationDate: stockData.hasExpirationDate,
                        allowNegativeStock: stockData.allowNegativeStock,
                        maliyetFiyat: Number(stockData.maliyet),
                        maliyetDoviz: stockData.maliyetDoviz || 'TRY',
                        brandId: stockData.brandId,
                    },
                    attributes: stockData.stockCardAttributeItems.map(item => ({
                        attributeId: item.attributeId,
                        value: item.attribute.value,
                    })),
                    barcodes: stockData.barcodes.map(item => ({
                        barcode: item.barcode,
                    })),
                    categoryItem: stockData.stockCardCategoryItem.map(item => ({
                        categoryId: item.categoryId,
                    })),
                    priceListItems: stockData.stockCardPriceLists.map(item => ({
                        priceListId: item.priceListId,
                        price: parseFloat(item.price),
                        vatRate: null,
                        priceWithVat: null,
                        barcode: '',
                    })),
                    stockCardWarehouse: stockData.stockCardWarehouse.map(item => ({
                        id: item.warehouseId,
                        quantity: Number(item.quantity),
                    })),
                    eFatura: stockData.stockCardEFatura.map(item => ({
                        productCode: item.productCode,
                        productName: item.productName,
                    })),
                    manufacturers: stockData.stockCardManufacturer.map(item => ({
                        productCode: item.productCode,
                        productName: item.productName,
                        barcode: item.barcode,
                        brandId: item.brandId,
                        currentId: item.currentId,
                    })),
                    marketNames: stockData.stockCardMarketNames.map(item => ({
                        marketName: item.marketName,
                    })),
                });

                localStorage.removeItem('currentStockData');
            } catch (err) {
                setError('Error loading stock data');
                console.error('Error parsing stock data:', err);
            }
        }
    }, []);

    const updateStockCard = useCallback(<K extends keyof StockFormState['stockCard']>(
        field: K,
        value: StockFormState['stockCard'][K]
    ) => {
        setFormState(prev => ({
            ...prev,
            stockCard: {
                ...prev.stockCard,
                [field]: value
            }
        }));
    }, []);

    const updateAttributes = useCallback((attributes: Array<{ attributeId: string; value: string }>) => {
        setFormState(prev => ({
            ...prev,
            attributes
        }));
    }, []);

    const updateBarcodes = useCallback((barcodes: string[]) => {
        setFormState(prev => ({
            ...prev,
            barcodes: barcodes.map(barcode => ({ barcode }))
        }));
    }, []);

    const updateMarketNames = useCallback((names: string[]) => {
        setFormState(prev => ({
            ...prev,
            marketNames: names.map(name => ({ marketName: name }))
        }));
    }, []);

    const updateCategories = useCallback((categoryIds: string[]) => {
        setFormState(prev => ({
            ...prev,
            categoryItem: categoryIds.map(id => ({ categoryId: id }))
        }));
    }, []);

    const updatePriceListItems = useCallback((items: Array<{
        priceListId: string;
        price: number;
        vatRate: number | null;
        priceWithVat: number | null;
        barcode: string;
    }>) => {
        setFormState(prev => ({
            ...prev,
            priceListItems: items
        }));
    }, []);

    const updateWarehouse = useCallback((warehouseId: string, quantity: number) => {
        setFormState(prev => ({
            ...prev,
            stockCardWarehouse: [{ id: warehouseId, quantity }]
        }));
    }, []);

    const updateManufacturers = useCallback((manufacturers: Array<{
        productCode: string;
        productName: string;
        barcode: string;
        brandId: string;
        currentId: string;
    }>) => {
        setFormState(prev => ({
            ...prev,
            manufacturers: [...manufacturers]
        }));
    }, []);

    const updateEFatura = useCallback((productCode: string, productName: string) => {
        setFormState(prev => ({
            ...prev,
            eFatura: [{
                productCode,
                productName,
            }]
        }));
    }, []);

    const calculatePriceWithVat = (price: number, vatRate: number | null) => {
        const result = price * (1 + (vatRate ?? 0) / 100);
        return parseFloat(result.toFixed(2));
    };

    const saveStockCard = async (priceLists: PriceList[], updatedFormState: StockFormState) => {
        try {
            setLoading(true);
            setError(null);

            const transformedPriceListItems = updatedFormState.priceListItems.map(
                (item) => {
                    const priceList = priceLists.find(
                        (pl: PriceList) => pl.id === item.priceListId
                    );
                    return {
                        priceListId: item.priceListId,
                        price: priceList?.isVatIncluded
                            ? calculatePriceWithVat(item.price, item.vatRate)
                            : item.price,
                    };
                }
            );

            const transformedAttributes = updatedFormState.attributes.map(
                ({ attributeId }) => ({
                    attributeId,
                })
            );

            const dataToSend = {
                ...updatedFormState,
                attributes: transformedAttributes,
                priceListItems: transformedPriceListItems,
            };

            const response = await fetch("http://localhost:1303/stockcards/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error("Failed to save stock card");
            }

            return await response.json();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                throw err;
            } else {
                const error = new Error("An unknown error occurred");
                setError(error.message);
                throw error;
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        formState,
        loading,
        error,
        updateStockCard,
        updateAttributes,
        updateBarcodes,
        updateMarketNames,
        updateCategories,
        updatePriceListItems,
        updateWarehouse,
        updateManufacturers,
        updateEFatura,
        saveStockCard,
    };
};