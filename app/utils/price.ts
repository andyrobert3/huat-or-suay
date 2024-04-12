import { fetchTokenPrices } from './binance';

const INTERVAL_MS = 1_500;

// Crypto tickers to keep in cache for price fetching
const TICKERS = [
    'BTC',
    'ETH',
    'SOL'
];

// Cache for token prices
let PRICE_CACHE: Record<string, number> = {};

const pollPrices = async () => {
    PRICE_CACHE = await fetchTokenPrices(TICKERS)
    // Set interval
    setInterval(async () => {
        PRICE_CACHE = await fetchTokenPrices(TICKERS)
    }, INTERVAL_MS);
}

export { pollPrices, PRICE_CACHE }