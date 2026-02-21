// types.ts
export interface Trade {
  id: string;
  timestamp: string; // e.g. "2025-03-01 09:30:00"
  asset: string;
  side: 'buy' | 'sell' | string;
  quantity: number;
  entry_price: number;
  exit_price: number;
  profit_loss: number;
  balance: number;
  // derived / optional fields
  day?: string; // e.g. "2025-03-01"
  hour?: number; // 0-23
  dateObj?: Date;
  monthKey?: string; // e.g. "2025-03"
  dayOfMonth?: number; // 1-31
  biasTags?: string[];
}

export interface BiasResultItem {
  detected: boolean;
  severity: 'low' | 'medium' | 'high' | string;
  message: string;
}

export interface BiasAnalysisResult {
  overtrading: BiasResultItem;
  lossAversion: BiasResultItem;
  revengeTrading: BiasResultItem;
}

export interface BiasDetection {
  detected: boolean;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface BiasAnalysisResult {
  overtrading: BiasDetection;
  lossAversion: BiasDetection;
  revengeTrading: BiasDetection;
}

// biasDetector.ts
export const analyzeTrades = (trades: Trade[]) => {
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const avgWin = sortedTrades.filter(t => t.profit_loss > 0)
    .reduce((acc, t) => acc + t.profit_loss, 0) / sortedTrades.length;

  return sortedTrades.map((trade, index) => {
    const tags: string[] = [];
    const currentTime = new Date(trade.timestamp).getTime();
    
    if (index > 0) {
      const prevTrade = sortedTrades[index - 1];
      const prevTime = new Date(prevTrade.timestamp).getTime();
      const timeDiffSec = (currentTime - prevTime) / 1000;

      // 1. REVENGE TRADING: Quick trade after a loss
      if (prevTrade.profit_loss < 0 && timeDiffSec < 300) { // < 5 mins
        tags.push('Revenge Trading');
      }

      // 2. OVERTRADING: High frequency (e.g., more than 3 trades in 10 mins)
      const recentTrades = sortedTrades.slice(Math.max(0, index - 3), index);
      const isClustered = recentTrades.every(t => 
        (currentTime - new Date(t.timestamp).getTime()) / 1000 < 600
      );
      if (isClustered) tags.push('Overtrading');
    }

    // 3. LOSS AVERSION: Holding a loser 2x bigger than average win
    if (trade.profit_loss < 0 && Math.abs(trade.profit_loss) > (avgWin * 2)) {
      tags.push('Poor Stop Loss');
    }

    return { ...trade, biasTags: tags };
  });
};