/**
 * CSE client built on top of the published @gajarthan/cse-mcp package.
 * We lazily import the ESM services to keep this project in CommonJS/ts-node.
 */
import { Quote, MarketStatus } from '../src/types';

type CseApi = {
  getStockQuote(symbol: string): Promise<any>;
  getMarketStatus(): Promise<any>;
};

let cseApiPromise: Promise<CseApi> | null = null;

async function getCseApi(): Promise<CseApi> {
  if (!cseApiPromise) {
    cseApiPromise = (async () => {
      const { CompanyLookupService } = await import('@gajarthan/cse-mcp/dist/services/companyLookup.js');
      const { CseApiService } = await import('@gajarthan/cse-mcp/dist/services/cseApi.js');
      const companyLookup = await CompanyLookupService.create();
      return new CseApiService({ companyLookup, timeoutMs: 10_000, maxRetries: 2 });
    })();
  }
  return cseApiPromise;
}

export async function getStockQuote(symbol: string): Promise<Quote> {
  const api = await getCseApi();
  const raw = await api.getStockQuote(symbol);
  return {
    symbol: raw.symbol,
    lastPrice: Number(raw.lastPrice ?? 0),
    previousClose: Number(raw.previousClose ?? raw.lastPrice ?? 0),
    change: Number(raw.change ?? 0),
    changePercent: Number(raw.changePercent ?? 0),
    shareVolume: Number(raw.todayShareVolume ?? 0),
    tradeCount: Number(raw.todayTradeCount ?? 0),
    turnover: Number(raw.todayTurnoverLkr ?? 0),
  };
}

export async function getMarketStatus(): Promise<MarketStatus> {
  const api = await getCseApi();
  const raw = await api.getMarketStatus();
  return { status: raw.status ?? 'Unknown' };
}
