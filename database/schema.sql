-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de gastos fijos mensuales
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de pagos de gastos fijos
CREATE TABLE IF NOT EXISTS fixed_expense_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fixed_expense_id UUID REFERENCES fixed_expenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  paid_amount DECIMAL(10,2) NOT NULL CHECK (paid_amount > 0),
  paid_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fixed_expense_id, month, year)
);

-- Crear tabla de cuentas por cobrar
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  debtor_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  expected_date DATE,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_id ON fixed_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_expense_payments_user_id ON fixed_expense_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_expense_payments_month_year ON fixed_expense_payments(month, year);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_user_id ON accounts_receivable(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_is_paid ON accounts_receivable(is_paid);

-- Insertar categorías predeterminadas (opcional, estas están hardcodeadas en el frontend)
-- Esta tabla es opcional ya que las categorías están definidas en el código
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
  color VARCHAR(7) NOT NULL, -- HEX color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías predeterminadas de ingresos
INSERT INTO categories (name, type, color) VALUES
('Salario', 'income', '#22c55e'),
('Freelance', 'income', '#3b82f6'),
('Inversiones', 'income', '#8b5cf6'),
('Bonos', 'income', '#06b6d4'),
('Otros ingresos', 'income', '#84cc16')
ON CONFLICT DO NOTHING;

-- Insertar categorías predeterminadas de gastos
INSERT INTO categories (name, type, color) VALUES
('Comida', 'expense', '#ef4444'),
('Transporte', 'expense', '#f97316'),
('Entretenimiento', 'expense', '#ec4899'),
('Salud', 'expense', '#14b8a6'),
('Servicios', 'expense', '#6366f1'),
('Compras', 'expense', '#f59e0b'),
('Otros gastos', 'expense', '#64748b')
ON CONFLICT DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas (para desarrollo)
-- En producción, implementarías autenticación adecuada

-- Política para usuarios (permite todo por ahora)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);

-- Política para transacciones (permite todo por ahora)  
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL USING (true);

-- Política para categorías (permite todo por ahora)
CREATE POLICY "Allow all operations on categories" ON categories
  FOR ALL USING (true);
