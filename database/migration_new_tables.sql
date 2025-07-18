-- Script para aplicar las nuevas tablas en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase

-- Crear tabla de gastos fijos mensuales
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31), -- Día del mes en que vence
  is_paid BOOLEAN DEFAULT FALSE,
  last_paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de cuentas por cobrar
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  debtor_name VARCHAR(200) NOT NULL, -- Nombre de quien debe
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL, -- Motivo de la deuda
  expected_date DATE, -- Fecha esperada de pago
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_id ON fixed_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_is_paid ON fixed_expenses(is_paid);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_user_id ON accounts_receivable(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_is_paid ON accounts_receivable(is_paid);

-- Habilitar RLS para las nuevas tablas
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para las nuevas tablas
CREATE POLICY "Allow all operations on fixed_expenses" ON fixed_expenses
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on accounts_receivable" ON accounts_receivable
  FOR ALL USING (true);
