import { Position } from '../types';

export const calculatePositions = () => {
    // Fixed positions according to specifications
    const qrCodePosition: Position = {
        x: 30, // 30mm from right edge
        y: 3,  // 3mm from top edge
    };

    // Text position
    const textPosition: Position = {
        x: 5,  // 5mm from right edge
        y: 25, // 25mm from top edge
    };

    return {
        qrCode: qrCodePosition,
        text: textPosition,
    };
};