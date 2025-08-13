-- Create Income table
CREATE TABLE public.income (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_income DECIMAL(10,2) NOT NULL DEFAULT 0,
  cash_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  credit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  actual_cash_received DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Expenses table
CREATE TABLE public.expenses (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Purchases table (subcategory of Expenses)
CREATE TABLE public.purchases (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  item_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_income_date ON public.income(date);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_purchases_expense_id ON public.purchases(expense_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_income_updated_at
  BEFORE UPDATE ON public.income
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();