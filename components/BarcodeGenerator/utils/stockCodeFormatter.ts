export const formatStockCode = (stockCode: string): string[] => {
    // Split the stock code by "/" character and filter out empty strings
    return stockCode.split('/').filter(part => part.trim().length > 0);
};

export const formatStockCodeForDisplay = (stockCode: string): string => {
    return formatStockCode(stockCode).join('\n');
};

export const calculateStockCodeHeight = (stockCode: string): number => {
    const parts = formatStockCode(stockCode);
    // Return height based on number of lines (each line ~5mm + spacing)
    return parts.length * 6; // 5mm for text + 1mm spacing
};