-- MIGRACIÓN: Agregar tablas para Gastos Fijos y Cuentas por Cobrar
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear tabla de gastos fijos mensuales
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Crear foreign key constraint solo si la tabla users existe
  CONSTRAINT fk_fixed_expenses_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- 2. Crear tabla de pagos de gastos fijos
CREATE TABLE IF NOT EXISTS fixed_expense_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fixed_expense_id UUID NOT NULL,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  paid_amount DECIMAL(10,2) NOT NULL CHECK (paid_amount > 0),
  paid_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar pagos duplicados del mismo mes/año
  CONSTRAINT unique_payment_per_month 
    UNIQUE(fixed_expense_id, month, year),
    
  -- Foreign key constraints
  CONSTRAINT fk_payments_expense 
    FOREIGN KEY (fixed_expense_id) 
    REFERENCES fixed_expenses(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_payments_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- 3. Crear tabla de cuentas por cobrar
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  debtor_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  expected_date DATE,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT fk_receivables_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- 4. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_id ON fixed_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_active ON fixed_expenses(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_fixed_expense_payments_user_id ON fixed_expense_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_expense_payments_month_year ON fixed_expense_payments(month, year);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_user_id ON accounts_receivable(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_is_paid ON accounts_receivable(is_paid);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_expected_date ON accounts_receivable(expected_date) WHERE expected_date IS NOT NULL;

-- 5. Habilitar Row Level Security (RLS) para las nuevas tablas
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expense_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas de seguridad básicas
-- Política para gastos fijos
CREATE POLICY "Allow all operations on fixed_expenses" ON fixed_expenses
  FOR ALL USING (true);

-- Política para pagos de gastos fijos
CREATE POLICY "Allow all operations on fixed_expense_payments" ON fixed_expense_payments
  FOR ALL USING (true);

-- Política para cuentas por cobrar
CREATE POLICY "Allow all operations on accounts_receivable" ON accounts_receivable
  FOR ALL USING (true);

-- 7. Verificar que las tablas se crearon correctamente
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('fixed_expenses', 'fixed_expense_payments', 'accounts_receivable')
ORDER BY table_name;
