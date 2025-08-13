export interface Income {
  id: number;
  date: string;
  total_income: number;
  cash_amount: number;
  credit_amount: number;
  other_amount: number;
  actual_cash_received: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: number;
  expense_id: number;
  item_name: string;
  quantity: number;
  price_per_unit: number;
  created_at: string;
  updated_at: string;
  expense?: Expense;
}

export interface CreateIncome {
  date: string;
  total_income: number;
  cash_amount: number;
  credit_amount: number;
  other_amount: number;
  actual_cash_received: number;
}

export interface CreateExpense {
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface CreatePurchase {
  expense_id: number;
  item_name: string;
  quantity: number;
  price_per_unit: number;
}