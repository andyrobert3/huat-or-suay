const BASE_URL = "https://www.binance.com/api/v3/ticker/price";

export const fetchTokenPrice = async (ticker: string): Promise<number> => {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    };

    const response = await fetch(`${BASE_URL}?symbol=${ticker.toUpperCase()}USDC`, options);
    const result = await response.json();

    if (result.code == -1121) {
        throw new Error('Invalid symbol');
    }

    return Number(result.price);
}

/**
 *
 * @param tickers Token tickers to fetch prices for
 */
export const fetchTokenPrices = async (tickers: string[]): Promise<Record<string, number>> => {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    };

    const literalTickers = `[${tickers.map(ticker => `\"${ticker.toUpperCase()}USDC\"`).join(',')}]`
    const response = await fetch(`${BASE_URL}?symbols=${literalTickers}`, options);
    const results = await response.json();

    if (results.code == -1121) {
        throw new Error('Invalid symbol');
    }

    // Sample of return value:
    // [{"symbol":"BTCUSDT","price":"70697.52000000"},{"symbol":"BNBUSDT","price":"603.40000000"}]
    const prices: Record<string, number> = {};
    for (const result of results) {
        prices[result.symbol.replace('USDC', '')] = Number(result.price);
    }

    return prices;
}