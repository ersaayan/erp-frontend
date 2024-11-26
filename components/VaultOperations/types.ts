export interface Vault {
    id: string;
    vaultName: string;
    branchCode: string;
    balance: string;
    currency: string;
}

export interface VaultMovement {
    id: string;
    vaultId: string;
    invoiceId: string | null;
    receiptId: string | null;
    description: string;
    entering: string;
    emerging: string;
    vaultDirection: 'Introduction' | 'Exit' | "ReceivedVirement";
    vaultType: 'DebtTransfer' | "ServiceChargeCollection" | "CompanyCreditCardWithdrawals" | "BuyingForeignCurrency" | "InputReceipt" | "BankWithdrawals" | "ReceivingValuableAssets" | "ReceivableTransfer" | "ServiceChargePayment" | "CompanyCreditCardDeposit" | "CurrencyExchange" | "LoanPayment" | "LoanWithdrawal" | "ExitReceipt" | "PaymentToBank" | "PreciousMetalExchange";
    vaultDocumentType: 'General' | "Accounting" | "Official";
    vault: {
        id: string;
        vaultName: string;
        branchCode: string;
        balance: string;
        currency: string;
    };
}