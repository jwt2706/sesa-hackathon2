/*
  # Create trades table for Bias Detector

  1. New Tables
    - `trades`
      - `id` (uuid, primary key) - Unique identifier for each trade
      - `timestamp` (timestamptz) - When the trade occurred
      - `asset` (text) - Asset name/symbol (e.g., AAPL, BTC)
      - `side` (text) - Buy or Sell
      - `quantity` (numeric) - Number of units traded
      - `entry_price` (numeric) - Price at entry
      - `exit_price` (numeric) - Price at exit
      - `profit_loss` (numeric) - P/L for the trade
      - `balance` (numeric) - Account balance after trade
      - `created_at` (timestamptz) - When record was created
      - `user_id` (uuid) - References auth.users for multi-user support

  2. Security
    - Enable RLS on `trades` table
    - Add policies for authenticated users to manage their own trades
*/

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL,
  asset text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity numeric NOT NULL CHECK (quantity > 0),
  entry_price numeric NOT NULL CHECK (entry_price > 0),
  exit_price numeric NOT NULL CHECK (exit_price > 0),
  profit_loss numeric NOT NULL,
  balance numeric NOT NULL CHECK (balance >= 0),
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS trades_user_id_idx ON trades(user_id);
CREATE INDEX IF NOT EXISTS trades_timestamp_idx ON trades(timestamp DESC);