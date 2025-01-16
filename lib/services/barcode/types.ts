export interface BarcodeData {
    stockCode: string;
}

export interface BarcodeTemplate {
    width: string;
    height: string;
    qrCodeSize: string;
    qrCodePosition: {
        left: string;
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