export interface Trade {
  id: string;
  timestamp: string;
  asset: string;
  side: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  exit_price: number;
  profit_loss: number;
  balance: number;
  user_id?: string;
  created_at?: string;
}

export interface BiasAnalysisResult {
  overtrading: {
    detected: boolean;
    severity: 'low' | 'medium' | 'high';
    message: string;
  };
  lossAversion: {
    detected: boolean;
    severity: 'low' | 'medium' | 'high';
    message: string;
  };
  revengeTrading: {
    detected: boolean;
    severity: 'low' | 'medium' | 'high';
    message: string;
  };
}
