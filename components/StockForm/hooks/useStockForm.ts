'use client';

import { useState, useCallback, useEffect } from 'react';
import { PriceList } from './usePriceLists';
import { StockCard } from '@/components/StockList/types';

interface StockFormState {
    stockCard: {
        id?: string;
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
        id?: string;
        priceListId: string;
        price: number;
        vatRate: number | null;
        priceWithVat: number | null;
        barcode: string;
    }>;
    stockCardWarehouse: Array<{ id?: string; warehouseId: string; quantity: number }>;
    eFatura: Array<{
        id?: string;
        productCode: string;
        productName: string;
    }>;
    manufacturers: Array<{
        id?: string;
        productCode: string;
        productName: string;
        barcode: string;
        brandId: string;
        currentId: string;
    }>;
    marketNames: Array<{ marketName: string }>;
    isUpdateMode: boolean;
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
    isUpdateMode: false,
};

const STORAGE_KEY = 'stockFormData';

export const useStockForm = () => {
    const [formState, setFormState] = useState<StockFormState>(() => {
        if (typeof window === "undefined") return initialState;

        // Check for existing form data first
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return initialState;

        try {
            return JSON.parse(savedData);
        } catch {
            return initialState;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedData = localStorage.getItem('currentStockData');
        console.log(savedData);
        if (savedData) {
            try {
                const stockData: StockCard = JSON.parse(savedData);
                // Manufacturers verilerini id değerleriyle dahil edin
                const manufacturers = stockData.stockCardManufacturer.map((item) => ({
                    id: item.id,
                    productCode: item.productCode,
                    productName: item.productName,
                    barcode: item.barcode,
                    brandId: item.brandId,
                    currentId: item.currentId,
                }));

                // PriceListItems verilerini id değerleriyle ve hesaplamalarla dahil edin
                const priceListItems = stockData.stockCardPriceLists.map((item) => {
                    // priceWithVat değerini hesaplayın
                    const priceWithVat = parseFloat(item.price) * (1 + (parseFloat(item.vatRate) ?? 0) / 100);

                    return {
                        id: item.id,
                        priceListId: item.priceListId,
                        price: parseFloat(item.price),
                        vatRate: parseFloat(item.vatRate) || 0,
                        priceWithVat: parseFloat(priceWithVat.toFixed(2)), // Hesaplanan değeri kullanın
                        barcode: item.barcode,
                    };
                });
                // stockCardWarehouse içindeki id değerini dahil edin
                const stockCardWarehouse = stockData.stockCardWarehouse.map((warehouse) => ({
                    id: warehouse.id,
                    warehouseId: warehouse.warehouseId,
                    quantity: Number(warehouse.quantity),
                }));
                // eFatura içindeki id değerini dahil edin
                const eFatura = stockData.stockCardEFatura.map((item) => ({
                    id: item.id,
                    productCode: item.productCode,
                    productName: item.productName,
                }));
                setFormState(prev => ({
                    ...prev,
                    isUpdateMode: true,
                    stockCard: {
                        ...prev.stockCard,
                        id: stockData.id,
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
                    stockCardWarehouse,
                    eFatura,
                    manufacturers: manufacturers,
                    priceListItems: priceListItems,
                    marketNames: stockData.stockCardMarketNames.map(item => ({
                        marketName: item.marketName,
                    })),
                }));
                console.log(formState);
                console.log('Stock data loaded successfully');
                console.log(stockData);
                localStorage.removeItem('currentStockData');
            } catch (err) {
                setError('Error loading stock data');
                console.error('Error parsing stock data:', err);
            }
        }
    }, [formState]);
    // Save form state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
        }
    }, [formState]);

    // Clear form data only when form is submitted successfully
    const clearFormData = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
            setFormState(initialState);
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
        id?: string;
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
        setFormState((prev) => {
            const existingWarehouse = prev.stockCardWarehouse[0] || {};
            return {
                ...prev,
                stockCardWarehouse: [
                    {
                        id: existingWarehouse.id, // Mevcut id değerini koruyun
                        warehouseId: warehouseId,
                        quantity: quantity,
                    },
                ],
            };
        });
    }, []);

    const updateManufacturers = useCallback((manufacturers: Array<{
        id?: string;
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
                id: prev.eFatura[0]?.id, // Mevcut id değerini koruyun
                productCode,
                productName,
            }]
        }));
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const calculatePriceWithVat = (price: number, vatRate: number | null) => {
        const result = price * (1 + (vatRate ?? 0) / 100);
        return parseFloat(result.toFixed(2));
    };

    const saveStockCard = async (priceLists: PriceList[], updatedFormState: StockFormState) => {
        try {
            setLoading(true);
            setError(null);

            // PriceListItems içindeki priceWithVat değerlerini güncelleyin
            const priceListItemsWithCalculations = updatedFormState.priceListItems.map((item) => {
                const priceWithVat = item.price * (1 + (item.vatRate ?? 0) / 100);
                return {
                    ...item,
                    priceWithVat: parseFloat(priceWithVat.toFixed(2)), // Hesaplanan değeri kullanın
                };
            });

            const transformedAttributes = updatedFormState.attributes.map(
                ({ attributeId }) => ({
                    attributeId,
                })
            );

            const dataToSend = {
                ...updatedFormState,
                attributes: transformedAttributes,
                priceListItems: priceListItemsWithCalculations,
            };

            const url = updatedFormState.isUpdateMode
                ? `${process.env.BASE_URL}/stockcards/updateStockCardsWithRelations/${updatedFormState.stockCard.id}`
                : `${process.env.BASE_URL}/stockcards/`;

            const method = updatedFormState.isUpdateMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error('Error saving stock card');
            }

            // Clear form data only after successful save
            clearFormData();

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
        clearFormData,
    };
};