export interface BarcodeData {
    stockCode: string;
    stockName: string;
    barcode: string;
}

export interface BarcodeTemplate {
    width: string;
    height: string;
    qrCodeSize: string;
    qrCodePosition: {
        left: string;
        top: string;
    };
    textPosition: {
        top: string;
    };
    fontFamily: string;
    fontSize: string;
}

export interface PrintPreviewOptions {
    showDialog: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export interface BarcodeValidationResult {
    isValid: boolean;
    message?: string;
}