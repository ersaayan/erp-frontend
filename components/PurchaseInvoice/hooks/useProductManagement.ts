import { useState, useCallback } from 'react';
import { StockItem } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useProductManagement = () => {
    const [products, setProducts] = useState<StockItem[]>([]);
    const { toast } = useToast();

    const addProducts = useCallback((newProducts: StockItem[]) => {
        setProducts(currentProducts => {
            const updatedProducts = [...currentProducts];

            newProducts.forEach(newProduct => {
                const existingIndex = updatedProducts.findIndex(
                    p => p.stockId === newProduct.stockId
                );

                if (existingIndex !== -1) {
                    // Update existing product quantity
                    const existingProduct = updatedProducts[existingIndex];
                    const newQuantity = existingProduct.quantity + 1;
                    updatedProducts[existingIndex] = {
                        ...existingProduct,
                        quantity: newQuantity,
                        vatAmount: (newQuantity * existingProduct.unitPrice * existingProduct.vatRate) / 100,
                        totalAmount: newQuantity * existingProduct.unitPrice +
                            (newQuantity * existingProduct.unitPrice * existingProduct.vatRate) / 100,
                    };
                } else {
                    // Add new product
                    updatedProducts.push(newProduct);
                }
            });

            return updatedProducts;
        });
    }, []);

    const updateProduct = useCallback((updatedProduct: StockItem) => {
        setProducts(currentProducts =>
            currentProducts.map(product =>
                product.id === updatedProduct.id ? updatedProduct : product
            )
        );
    }, []);

    const removeProduct = useCallback((productId: string) => {
        setProducts(currentProducts =>
            currentProducts.filter(product => product.id !== productId)
        );
    }, []);

    const calculateTotals = useCallback(() => {
        return products.reduce(
            (acc, product) => ({
                subtotal: acc.subtotal + product.unitPrice * product.quantity,
                vatTotal: acc.vatTotal + product.vatAmount,
                total: acc.total + product.totalAmount,
            }),
            { subtotal: 0, vatTotal: 0, total: 0 }
        );
    }, [products]);

    return {
        products,
        addProducts,
        updateProduct,
        removeProduct,
        calculateTotals,
    };
};