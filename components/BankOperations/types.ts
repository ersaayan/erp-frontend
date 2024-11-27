export interface Bank {
    id: string;
    bankName: string;
    branchCode: string;
    balance: string;
    currency: string;
}

export interface BankMovement {
    id: string;
    bankId: string;
    invoiceId: string | null;
    receiptId: string | null;
    description: string;
    entering: string;
    emerging: string;
    bankDirection: 'Introduction' | 'Exit' | "ReceivedVirement";
    bankType: 'DebtTransfer' | "ServiceChargeCollection" | "CompanyCreditCardWithdrawals" | "BuyingForeignCurrency" | "InputReceipt" | "BankWithdrawals" | "ReceivingValuableAssets" | "ReceivableTransfer" | "ServiceChargePayment" | "CompanyCreditCardDeposit" | "CurrencyExchange" | "LoanPayment" | "LoanWithdrawal" | "ExitReceipt" | "PaymentToBank" | "PreciousMetalExchange" | "POSWithdrawals" | "OutgoingVirement" | "InGoingVirement";
    bankDocumentType: 'General' | "Accounting" | "Official";
    bank: {
        id: string;
        bankName: string;
        branchCode: string;
        balance: string;
        currency: string;
    };
}