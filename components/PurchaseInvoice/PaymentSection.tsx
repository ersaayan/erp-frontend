"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentMethod {
    id: string;
    type: "cash" | "card" | "transfer" | "check" | "note";
    amount: number;
    accountId?: string;
}

interface PaymentSectionProps {
    total: number;
    vaults: any[];
    banks: any[];
    posDevices: any[];
    onPaymentSubmit: (payments: PaymentMethod[]) => Promise<void>;
    loading: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
                                                           total,
                                                           vaults,
                                                           banks,
                                                           posDevices,
                                                           onPaymentSubmit,
                                                           loading,
                                                       }) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod["type"]>("cash");
    const [amount, setAmount] = useState<string>("");
    const [accountId, setAccountId] = useState<string>("");
    const [payments, setPayments] = useState<PaymentMethod[]>([]);
    const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<PaymentMethod | null>(null);

    const remainingAmount = total - payments.reduce((sum, p) => sum + p.amount, 0);

    const handleAddPayment = () => {
        if (!amount || parseFloat(amount) <= 0 || !selectedMethod) return;

        const newPayment: PaymentMethod = {
            id: editingPayment?.id || crypto.randomUUID(),
            type: selectedMethod,
            amount: parseFloat(amount),
            accountId: accountId || undefined,
        };

        if (editingPayment) {
            setPayments(payments.map(p => p.id === editingPayment.id ? newPayment : p));
            setEditingPayment(null);
        } else {
            setPayments([...payments, newPayment]);
        }

        setAmount("");
        setAccountId("");
    };

    const handleEditPayment = (payment: PaymentMethod) => {
        setEditingPayment(payment);
        setSelectedMethod(payment.type);
        setAmount(payment.amount.toString());
        setAccountId(payment.accountId || "");
    };

    const handleDeletePayment = (payment: PaymentMethod) => {
        setPaymentToDelete(payment);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (paymentToDelete) {
            setPayments(payments.filter(p => p.id !== paymentToDelete.id));
        }
        setDeleteDialogOpen(false);
        setPaymentToDelete(null);
    };

    const handleSubmit = async () => {
        await onPaymentSubmit(payments);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span>Toplam Tutar</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Kalan Tutar</span>
                    <span className={remainingAmount > 0 ? "text-red-500" : "text-green-500"}>
            {formatCurrency(remainingAmount)}
          </span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant={selectedMethod === "cash" ? "default" : "outline"}
                        onClick={() => setSelectedMethod("cash")}
                    >
                        Nakit
                    </Button>
                    <Button
                        variant={selectedMethod === "card" ? "default" : "outline"}
                        onClick={() => setSelectedMethod("card")}
                    >
                        Kredi Kartı
                    </Button>
                    <Button
                        variant={selectedMethod === "transfer" ? "default" : "outline"}
                        onClick={() => setSelectedMethod("transfer")}
                    >
                        Havale/EFT
                    </Button>
                    <Button
                        variant={selectedMethod === "check" ? "default" : "outline"}
                        onClick={() => setSelectedMethod("check")}
                    >
                        Çek
                    </Button>
                    <Button
                        variant={selectedMethod === "note" ? "default" : "outline"}
                        onClick={() => setSelectedMethod("note")}
                        className="col-span-2"
                    >
                        Senet
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label>Tutar</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    {selectedMethod === "cash" && (
                        <div>
                            <Label>Kasa</Label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Kasa seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vaults.map((vault) => (
                                        <SelectItem key={vault.id} value={vault.id}>
                                            {vault.vaultName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedMethod === "transfer" && (
                        <div>
                            <Label>Banka Hesabı</Label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Banka hesabı seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {banks.map((bank) => (
                                        <SelectItem key={bank.id} value={bank.id}>
                                            {bank.bankName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedMethod === "card" && (
                        <div>
                            <Label>POS</Label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="POS seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {posDevices.map((pos) => (
                                        <SelectItem key={pos.id} value={pos.id}>
                                            {pos.posName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <Button
                    className="w-full"
                    onClick={handleAddPayment}
                    disabled={!amount || parseFloat(amount) <= 0}
                >
                    {editingPayment ? "Ödemeyi Güncelle" : "Ödeme Ekle"}
                </Button>

                {payments.length > 0 && (
                    <div className="space-y-2">
                        <Label>Eklenen Ödemeler</Label>
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex justify-between items-center p-2 border rounded"
                            >
                                <span>{payment.type}</span>
                                <span>{formatCurrency(payment.amount)}</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditPayment(payment)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeletePayment(payment)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={loading || remainingAmount !== 0}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ödemeleri Tamamla
                </Button>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ödemeyi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu ödemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Sil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PaymentSection;