export type Quote = {
  symbol: string;
  lastPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  shareVolume: number;
  tradeCount: number;
  turnover: number;
  tradesTime?: number;
};

export type MarketStatus = {
  status: string;
};

export type QuoteSnapshot = Quote &
  MarketStatus & {
    fetchedAt: string;
    direction: 'up' | 'down' | 'flat';
    priceMoved: boolean;
    marketOpenAndQuoted: boolean;
  };
