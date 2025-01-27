export interface Pos {
    id: string;
    posName: string;
    branchCode: string;
    balance: string;
    currency: string;
}

export interface PosMovement {
    id: string;
    posId: string;
    invoiceId: string | null;
    receiptId: string | null;
    description: string;
    entering: string;
    emerging: string;
    posDirection: 'Introduction' | 'Exit' | "ReceivedVirement";
    posType: 'DebtTransfer' | "ServiceChargeCollection" | "CompanyCreditCardWithdrawals" | "BuyingForeignCurrency" | "InputReceipt" | "BankWithdrawals" | "ReceivingValuableAssets" | "ReceivableTransfer" | "ServiceChargePayment" | "CompanyCreditCardDeposit" | "CurrencyExchange" | "LoanPayment" | "LoanWithdrawal" | "ExitReceipt" | "PaymentToBank" | "PreciousMetalExchange" | "OutgoingVirement" | "InGoingVirement";
    posDocumentType: 'General' | "Accounting" | "Official";
    pos: {
        id: string;
        posName: string;
        branchCode: string;
        balance: string;
        currency: string;
    };
}