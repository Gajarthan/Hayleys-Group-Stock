import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { QuoteSnapshot } from '../src/types';

const LATEST_PATH = path.join(__dirname, '..', 'data', 'hayl', 'latest.json');

function main() {
  if (!existsSync(LATEST_PATH)) {
    console.log('No data yet. Run `npm run fetch` first.');
    return;
  }
  const latest: QuoteSnapshot = JSON.parse(readFileSync(LATEST_PATH, 'utf8'));
  console.log('Latest snapshot:');
  console.table({
    symbol: latest.symbol,
    lastPrice: latest.lastPrice,
    change: latest.change,
    changePercent: latest.changePercent,
    status: latest.status,
    shareVolume: latest.shareVolume,
    tradeCount: latest.tradeCount,
    turnover: latest.turnover,
    direction: latest.direction,
    marketOpenAndQuoted: latest.marketOpenAndQuoted,
    fetchedAt: latest.fetchedAt,
  });
}

main();
