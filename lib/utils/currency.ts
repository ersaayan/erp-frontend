export const getCurrencySymbol = (currency: string): string => {
    switch (currency?.toUpperCase()) {
        case 'TRY':
            return '₺';
        case 'USD':
            return '$';
        case 'EUR':
            return '€';
        case 'GBP':
            return '£';
        default:
            return currency;
    }
};