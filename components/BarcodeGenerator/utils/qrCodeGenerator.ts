import QRCode from 'qrcode';

export const generateQRCode = async (text: string): Promise<string> => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(text, {
            width: 200,
            margin: 0,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });
        return qrCodeDataUrl;
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw new Error('QR kod oluşturulamadı');
    }
};