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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

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
