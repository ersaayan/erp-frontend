"use client";

import { useState, useCallback, useEffect } from "react";
import { CartItem, Customer, Sale } from "../types";
import { useToast } from "@/hooks/use-toast";
import Decimal from "decimal.js";
import { PaymentDetails } from "../PaymentSection/types";

export const useQuickSales = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [payments, setPayments] = useState<PaymentDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const { toast } = useToast();

    // Mevcut siparişi yükle
    useEffect(() => {
        const loadExistingOrder = async () => {
            const orderData = localStorage.getItem("currentInvoiceData");
            if (!orderData) return;

            try {
                const order = JSON.parse(orderData);
                if (order.documentType === "Invoice" || order.documentType === "Order") {
                    setIsEditMode(true);
                    setCurrentOrderId(order.id);

                    // Sepet öğelerini ayarla
                    setCart(order.items.map((item: any) => ({
                        id: item.id,
                        productId: item.stockId,
                        name: item.stockName,
                        code: item.stockCode,
                        barcode: item.barcode || "",
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        discountRate: item.discountRate || 0,
                        discountAmount: item.discountAmount || 0,
                        vatRate: item.vatRate,
                        vatAmount: item.vatAmount,
                        totalAmount: item.totalAmount,
                        unit: item.unit,
                        currency: item.currency || "TRY", // Varsayılan para birimi
                    })));

                    // Müşteri bilgilerini ayarla
                    if (order.current) {
                        setCustomer({
                            id: order.current.id,
                            name: order.current.currentName,
                            code: order.current.currentCode,
                            taxNumber: order.current.taxNumber || "",
                            taxOffice: order.current.taxOffice || "",
                            address: order.current.address || "",
                            phone: order.current.phone || "",
                            email: order.current.email || "",
                            priceListId: order.current.priceListId || "",
                            priceList: order.current.priceList ? {
                                id: order.current.priceList.id,
                                priceListName: order.current.priceList.priceListName,
                                currency: order.current.priceList.currency,
                                isVatIncluded: order.current.priceList.isVatIncluded,
                            } : undefined,
                        });
                    }

                    // Ödemeleri ayarla
                    if (order.payments && order.payments.length > 0) {
                        setPayments(order.payments.map((payment: any) => ({
                            id: payment.id || crypto.randomUUID(),
                            method: payment.method,
                            amount: payment.amount,
                            accountId: payment.accountId,
                            currency: payment.currency || "TRY",
                            description: payment.description,
                        })));
                    } else {
                        // Eğer ödeme yoksa, toplam tutarı açık hesap olarak ekle
                        const totalAmount = order.items.reduce((sum: number, item: any) =>
                            sum + (item.totalAmount || 0), 0);

                        setPayments([{
                            id: crypto.randomUUID(),
                            method: "openAccount",
                            amount: totalAmount,
                            accountId: "open-account",
                            currency: "TRY",
                            description: `${order.invoiceNo} no'lu belge için açık hesap`,
                        }]);
                    }

                    // Temizle
                    localStorage.removeItem("currentInvoiceData");
                }
            } catch (error) {
                console.error("Error loading existing order:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load existing order",
                });
            }
        };

        loadExistingOrder();
    }, [toast]);

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
                id: currentOrderId || crypto.randomUUID(),
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

            const endpoint = isEditMode
                ? `${process.env.BASE_URL}/invoices/updateQuickSaleInvoice/${currentOrderId}`
                : `${process.env.BASE_URL}/invoices/createQuickSaleInvoiceWithRelations`;

            const response = await fetch(endpoint, {
                method: isEditMode ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
                body: JSON.stringify(sale),
            });

            if (!response.ok) {
                throw new Error(isEditMode ? "Failed to update sale" : "Failed to process sale");
            }

            toast({
                title: "Success",
                description: isEditMode ? "Sale updated successfully" : "Sale completed successfully",
            });

            // Reset the form
            setCart([]);
            setCustomer(null);
            setPayments([]);
            setIsEditMode(false);
            setCurrentOrderId(null);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to process sale",
            });
        } finally {
            setLoading(false);
        }
    }, [cart, customer, toast, isEditMode, currentOrderId]);

    return {
        cart,
        customer,
        payments,
        loading,
        isEditMode,
        addToCart,
        updateCartItem,
        removeFromCart,
        setCustomer,
        setPayments,
        processPayment,
    };
};

export default useQuickSales;