export interface ExchangeRate {
    USD_TRY: number;
    EUR_TRY: number;
    timestamp: number;
  }
  
  class CurrencyService {
    private static instance: CurrencyService;
    private rates: ExchangeRate | null = null;
    private lastFetch: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
    private constructor() {}
  
    public static getInstance(): CurrencyService {
      if (!CurrencyService.instance) {
        CurrencyService.instance = new CurrencyService();
      }
      return CurrencyService.instance;
    }
  
    private async fetchRates(): Promise<ExchangeRate> {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        return {
          USD_TRY: data.rates.TRY,
          EUR_TRY: data.rates.TRY / data.rates.EUR,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return {
          USD_TRY: 31.50, // Fallback değer
          EUR_TRY: 33.50, // Fallback değer
          timestamp: Date.now()
        };
      }
    }
  
    public async getExchangeRates(): Promise<ExchangeRate> {
      const now = Date.now();
      
      if (!this.rates || (now - this.lastFetch) > this.CACHE_DURATION) {
        this.rates = await this.fetchRates();
        this.lastFetch = now;
      }
      
      return this.rates;
    }
  }
  
  export const currencyService = CurrencyService.getInstance();