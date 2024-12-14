export interface BarcodeFormData {
    stockCode: string;
    paperWidth: number;
    paperHeight: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface PreviewData {
    qrCode: string;
    qrCodeSize: number;
    qrCodePosition: Position;
    textPosition: Position;
    stockCode: string;
    paperWidth: number;
    paperHeight: number;
}