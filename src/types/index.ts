export type MovementType = 'income' | 'expense';

export interface Movement {
  id: string;
  type: MovementType;
  amount: number;
  concept: string;
  date: string; // ISO date string
  receipt_url?: string; // Image data URL or cloud URL
  notes?: string;
  created_at: string;
  running_balance?: number;
}

export interface BalanceSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  movementsCount: number;
}
