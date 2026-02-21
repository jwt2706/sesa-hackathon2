import { Trade, BiasAnalysisResult, BiasResultItem } from '../types/trade';

type MonthlyCounts = Record<string, number>;

const mk = (detected: boolean, severity: BiasResultItem['severity'], message: string): BiasResultItem => ({ detected, severity, message });

export const analyzePersonal = (rawTrades: Trade[]): { analysis: BiasAnalysisResult; monthlyCounts: MonthlyCounts } => {
  const trades = [...rawTrades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const total = trades.length;

  // monthly counts
  const monthlyCounts: MonthlyCounts = {};
  trades.forEach((t) => {
    const d = t.dateObj ? new Date(t.dateObj) : new Date(t.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
  });

  // basic stats
  const wins = trades.filter((t) => t.profit_loss > 0);
  const losses = trades.filter((t) => t.profit_loss < 0);
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.profit_loss, 0) / wins.length : 0;
  const avgLossMag = losses.length ? Math.abs(losses.reduce((s, t) => s + t.profit_loss, 0) / losses.length) : 0;

  // OVERTRADING: look for many clustered trades + high monthly count relative to median
  const avgTradesPerMonth = Object.values(monthlyCounts).reduce((s, n) => s + n, 0) / Math.max(1, Object.keys(monthlyCounts).length);
  const highMonthCount = Object.values(monthlyCounts).some((c) => c > Math.max(10, avgTradesPerMonth * 1.8));

  // cluster detection: count windows where 3+ trades happen within 30 minutes
  let clusterWindows = 0;
  for (let i = 0; i < trades.length; i++) {
    const windowEnd = new Date(trades[i].timestamp).getTime() + 30 * 60 * 1000;
    let count = 1;
    for (let j = i + 1; j < trades.length && new Date(trades[j].timestamp).getTime() <= windowEnd; j++) count++;
    if (count >= 3) clusterWindows++;
  }

  const overtradingDetected = highMonthCount || clusterWindows > Math.max(1, total * 0.02);
  const overtradingSeverity = clusterWindows > Math.max(3, total * 0.05) || avgTradesPerMonth > 60 ? 'high' : overtradingDetected ? 'medium' : 'low';

  // LOSS AVERSION: average loss magnitude much larger than average win
  const lossAversionRatio = avgWin > 0 ? avgLossMag / avgWin : avgLossMag > 0 ? Infinity : 0;
  const lossAversionDetected = lossAversionRatio > 1.2 || (losses.length / Math.max(1, total)) > 0.5;
  const lossAversionSeverity = lossAversionRatio > 2 || (losses.length / Math.max(1, total)) > 0.7 ? 'high' : lossAversionDetected ? 'medium' : 'low';

  // REVENGE TRADING: losses followed quickly by another trade (within 1 hour) with same direction tilt
  let revengeCount = 0;
  for (let i = 1; i < trades.length; i++) {
    const prev = trades[i - 1];
    const cur = trades[i];
    const dt = (new Date(cur.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000; // seconds
    if (prev.profit_loss < 0 && dt < 3600) revengeCount++;
  }
  const revengeDetected = revengeCount > Math.max(1, total * 0.02);
  const revengeSeverity = revengeCount > Math.max(3, total * 0.05) ? 'high' : revengeDetected ? 'medium' : 'low';

  const analysis: BiasAnalysisResult = {
    overtrading: mk(overtradingDetected, overtradingSeverity, `Cluster windows: ${clusterWindows}, avgTradesPerMonth: ${avgTradesPerMonth.toFixed(1)}`),
    lossAversion: mk(lossAversionDetected, lossAversionSeverity, `avgLoss/avgWin ratio: ${lossAversionRatio === Infinity ? '∞' : lossAversionRatio.toFixed(2)}`),
    revengeTrading: mk(revengeDetected, revengeSeverity, `quick-loss-followups: ${revengeCount}`),
  };

  return { analysis, monthlyCounts };
};

// Optional lightweight recommendation generator (deterministic). Use LLM integration separately if desired.
export const generateRecommendations = (analysis: BiasAnalysisResult) => {
  const recs: string[] = [];
  if (analysis.overtrading.detected) {
    recs.push('Reduce trade frequency: set a daily trade cap and cool-down after clusters.');
  } else {
    recs.push('Trade frequency looks reasonable.');
  }

  if (analysis.lossAversion.detected) {
    recs.push('Review stop-loss sizing and risk per trade to avoid outsized losses relative to wins.');
  } else {
    recs.push('Loss magnitudes are balanced vs wins.');
  }

  if (analysis.revengeTrading.detected) {
    recs.push('Avoid immediate re-entry after losses; add a mandatory cool-off or review process.');
  } else {
    recs.push('No strong revenge-trading pattern detected.');
  }

  return recs.join(' ');
};

// Hugging Face summarizer helper: sends a prompt and returns the model output string.
export const summarizeWithHuggingFace = async (prompt: string, model = 'google/flan-t5-large') => {
  try {
    const key = (import.meta.env && (import.meta.env as any).VITE_HF_API_KEY) || (process && (process.env as any).VITE_HF_API_KEY) || '';
    if (!key) return null;

    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 300 } }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data[0] && data[0].generated_text) return data[0].generated_text;
    if (typeof data === 'string') return data;
    if (data && data[0] && data[0].summary_text) return data[0].summary_text;
    return JSON.stringify(data);
  } catch (err) {
    return null;
  }
};

export default analyzePersonal;
