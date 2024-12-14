import { Position } from '../types';

export const calculatePositions = (paperWidth: number, paperHeight: number) => {
    // QR code position (centered horizontally, 1mm from top)
    const qrCodePosition: Position = {
        x: (paperWidth - 20) / 2, // 20mm is QR code size
        y: 1,
    };

    // Text position (4mm from left edge of QR code, 2mm below QR code)
    const textPosition: Position = {
        x: qrCodePosition.x + 4,
        y: qrCodePosition.y + 20 + 2, // QR code height (20mm) + 2mm gap
    };

    return {
        qrCode: qrCodePosition,
        text: textPosition,
    };
};