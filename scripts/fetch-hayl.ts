import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import path from 'path';
import { getMarketStatus, getStockQuote } from '../services/cse';
import { QuoteSnapshot } from '../src/types';

const SYMBOL = 'HAYL.N0000';
const DATA_DIR = path.join(__dirname, '..', 'data', 'hayl');
const LATEST_PATH = path.join(DATA_DIR, 'latest.json');
const HISTORY_PATH = path.join(DATA_DIR, 'history.ndjson');

function ensureDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function derive(snapshot: QuoteSnapshot): QuoteSnapshot {
  const direction: QuoteSnapshot['direction'] =
    snapshot.change > 0 ? 'up' : snapshot.change < 0 ? 'down' : 'flat';
  const priceMoved = snapshot.lastPrice !== snapshot.previousClose;
  const marketOpenAndQuoted =
    snapshot.status.toLowerCase().includes('open') && snapshot.lastPrice > 0;
  return { ...snapshot, direction, priceMoved, marketOpenAndQuoted };
}

function loadLatest(): QuoteSnapshot | null {
  if (!existsSync(LATEST_PATH)) return null;
  return JSON.parse(readFileSync(LATEST_PATH, 'utf8'));
}

function hasMeaningfulChange(prev: QuoteSnapshot | null, next: QuoteSnapshot): boolean {
  if (!prev) return true;
  const keys: (keyof QuoteSnapshot)[] = [
    'lastPrice',
    'previousClose',
    'change',
    'changePercent',
    'status',
    'shareVolume',
    'tradeCount',
    'turnover',
  ];
  return keys.some((k) => prev[k] !== next[k]);
}

async function main() {
  ensureDirs();
  const [quote, market] = await Promise.all([getStockQuote(SYMBOL), getMarketStatus()]);

  const base: QuoteSnapshot = derive({
    ...quote,
    ...market,
    fetchedAt: new Date().toISOString(),
    direction: 'flat',
    priceMoved: false,
    marketOpenAndQuoted: false,
  });

  const latest = loadLatest();
  const changed = hasMeaningfulChange(latest, base);

  writeFileSync(LATEST_PATH, JSON.stringify(base, null, 2));

  if (changed) {
    appendFileSync(HISTORY_PATH, JSON.stringify(base) + '\n');
  }

  console.log(
    changed
      ? `Snapshot recorded for ${SYMBOL}`
      : `No meaningful change for ${SYMBOL}; history not updated.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
