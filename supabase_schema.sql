-- SmartFinance Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'tag'
);

-- Enable RLS for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own categories" 
    ON public.categories FOR ALL 
    USING (auth.uid() = user_id);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions" 
    ON public.transactions FOR ALL 
    USING (auth.uid() = user_id);

-- 3. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    monthly_limit DECIMAL(12,2) NOT NULL,
    month VARCHAR(7) NOT NULL,  -- YYYY-MM
    alert_threshold INT DEFAULT 80, -- percent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own budgets" 
    ON public.budgets FOR ALL 
    USING (auth.uid() = user_id);

-- 4. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
    next_renewal DATE NOT NULL,
    category VARCHAR(100) DEFAULT 'Subscription',
    status VARCHAR(20) CHECK (status IN ('active', 'paused', 'cancelled')) DEFAULT 'active',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own subscriptions" 
    ON public.subscriptions FOR ALL 
    USING (auth.uid() = user_id);

-- 5. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    saved_amount DECIMAL(12,2) DEFAULT 0,
    target_date DATE,
    note TEXT,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Savings Goals
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own savings goals" 
    ON public.savings_goals FOR ALL 
    USING (auth.uid() = user_id);

-- Trigger to create default categories on user sign up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.categories (user_id, name, type, color, icon)
  values 
    (new.id, 'Salary', 'income', '#22c55e', 'briefcase'),
    (new.id, 'Freelance', 'income', '#3b82f6', 'laptop'),
    (new.id, 'Investment', 'income', '#8b5cf6', 'trending-up'),
    (new.id, 'Food & Dining', 'expense', '#f97316', 'utensils'),
    (new.id, 'Transport', 'expense', '#06b6d4', 'car'),
    (new.id, 'Shopping', 'expense', '#ec4899', 'shopping-bag'),
    (new.id, 'Bills & Utilities', 'expense', '#eab308', 'zap'),
    (new.id, 'Health', 'expense', '#ef4444', 'heart'),
    (new.id, 'Entertainment', 'expense', '#a855f7', 'film'),
    (new.id, 'Education', 'expense', '#14b8a6', 'book');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
