"use client";

import { useState, useCallback } from "react";
import { CartItem, Customer, Sale } from "../types";
import { useToast } from "@/hooks/use-toast";
import Decimal from "decimal.js";
import { PaymentDetails } from "../PaymentSection/types";

export const useQuickSales = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [payments, setPayments] = useState<PaymentDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const calculateItemTotals = useCallback((item: CartItem): CartItem => {
        const quantity = new Decimal(item.quantity);
        const unitPrice = new Decimal(item.unitPrice);
        const discountRate = new Decimal(item.discountRate);
        const vatRate = new Decimal(item.vatRate);

        const subtotal = quantity.times(unitPrice);
        const discountAmount = subtotal.times(discountRate.dividedBy(100));
        const afterDiscount = subtotal.minus(discountAmount);
        const vatAmount = afterDiscount.times(vatRate.dividedBy(100));
        const totalAmount = afterDiscount.plus(vatAmount);

        return {
            ...item,
            discountAmount: discountAmount.toNumber(),
            vatAmount: vatAmount.toNumber(),
            totalAmount: totalAmount.toNumber(),
        };
    }, []);

    const addToCart = useCallback((item: CartItem) => {
        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (cartItem) => cartItem.productId === item.productId
            );

            if (existingItem) {
                return currentCart.map((cartItem) =>
                    cartItem.productId === item.productId
                        ? calculateItemTotals({
                            ...cartItem,
                            quantity: cartItem.quantity + 1,
                        })
                        : cartItem
                );
            }

            return [...currentCart, calculateItemTotals(item)];
        });
    }, [calculateItemTotals]);

    const updateCartItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item.id === itemId
                    ? calculateItemTotals({ ...item, ...updates })
                    : item
            )
        );
    }, [calculateItemTotals]);

    const removeFromCart = useCallback((itemId: string) => {
        setCart((currentCart) => currentCart.filter((item) => item.id !== itemId));
    }, []);

    const processPayment = useCallback(async (payments: PaymentDetails[], branchCode: string, warehouseId: string) => {
        try {
            setLoading(true);

            const sale: Sale = {
                id: crypto.randomUUID(),
                date: new Date(),

                subtotal: cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
                totalDiscount: cart.reduce((sum, item) => sum + item.discountAmount, 0),
                totalVat: cart.reduce((sum, item) => sum + item.vatAmount, 0),
                total: cart.reduce((sum, item) => sum + item.totalAmount, 0),
                status: "completed",
                branchCode: branchCode,
                warehouseId: warehouseId,
                customer: customer,
                items: cart,
                payments: payments.map(payment => ({
                    method: payment.method,
                    amount: payment.amount,
                    accountId: payment.accountId,
                    currency: payment.currency,
                    description: payment.description
                })),

            };

            const response = await fetch(`${process.env.BASE_URL}/invoices/createQuickSaleInvoiceWithRelations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
                body: JSON.stringify(sale),
            });

            if (!response.ok) {
                throw new Error("Failed to process sale");
            }

            toast({
                title: "Success",
                description: "Sale completed successfully",
            });

            // Reset the cart and customer after successful sale
            setCart([]);
            setCustomer(null);
            setPayments([]);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to process sale",
            });
        } finally {
            setLoading(false);
        }
    }, [cart, customer, toast]);

    return {
        cart,
        customer,
        payments,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        setCustomer,
        setPayments,
        processPayment,
    };
};

export default useQuickSales;