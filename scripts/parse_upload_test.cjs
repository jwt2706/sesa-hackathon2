const fs = require('fs');
const path = require('path');

function parseCsvText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const trades = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const tradeData = {};
    headers.forEach((header, i) => {
      tradeData[header] = values[i] || '';
    });

    return {
      id: `upload-${Date.now()}-${index}`,
      timestamp: tradeData.timestamp || new Date().toISOString(),
      asset: tradeData.asset || '',
      side: (tradeData.side && tradeData.side.toLowerCase() === 'buy' ? 'buy' : 'sell'),
      quantity: parseFloat(tradeData.quantity || '0'),
      entry_price: parseFloat(tradeData.entry_price || tradeData.entryprice || '0'),
      exit_price: parseFloat(tradeData.exit_price || tradeData.exitprice || '0'),
      profit_loss: parseFloat(tradeData.profit_loss || tradeData.profitloss || tradeData.p_l || tradeData.pl || '0'),
      balance: parseFloat(tradeData.balance || '0'),
    };
  });

  return trades;
}

const csvPath = path.join(__dirname, '..', 'trading_datasets', 'calm_trader.csv');
if (!fs.existsSync(csvPath)) {
  console.error('CSV not found at', csvPath);
  process.exit(2);
}

const text = fs.readFileSync(csvPath, 'utf8');
const trades = parseCsvText(text);
console.log('Parsed trades count:', trades.length);
console.log('First 5 trades:', JSON.stringify(trades.slice(0, 5), null, 2));

const valid = trades.filter(r => r.timestamp && r.asset && (r.side === 'buy' || r.side === 'sell') && Number.isFinite(r.quantity) && Number.isFinite(r.entry_price) && Number.isFinite(r.exit_price) && r.quantity > 0 && r.entry_price > 0 && r.exit_price > 0);
console.log('Valid for DB insert count:', valid.length);
if (valid.length === 0) {
  console.log('No rows look valid for insertion under current constraints.');
}
