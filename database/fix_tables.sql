-- PASO 1: Verificar si las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('fixed_expenses', 'accounts_receivable');

-- PASO 2: Si no existen, eliminar tablas si existen parcialmente y recrear
DROP TABLE IF EXISTS fixed_expenses CASCADE;
DROP TABLE IF EXISTS accounts_receivable CASCADE;

-- PASO 3: Crear tabla de gastos fijos mensuales
CREATE TABLE fixed_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  is_paid BOOLEAN DEFAULT FALSE,
  last_paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 4: Crear tabla de cuentas por cobrar
CREATE TABLE accounts_receivable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  debtor_name VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  expected_date DATE,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 5: Crear índices
CREATE INDEX idx_fixed_expenses_user_id ON fixed_expenses(user_id);
CREATE INDEX idx_fixed_expenses_is_paid ON fixed_expenses(is_paid);
CREATE INDEX idx_accounts_receivable_user_id ON accounts_receivable(user_id);
CREATE INDEX idx_accounts_receivable_is_paid ON accounts_receivable(is_paid);

-- PASO 6: Habilitar RLS
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;

-- PASO 7: Crear políticas de seguridad
CREATE POLICY "Allow all operations on fixed_expenses" ON fixed_expenses
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on accounts_receivable" ON accounts_receivable
  FOR ALL USING (true);

-- PASO 8: Verificar que todo se creó correctamente
SELECT 
  'fixed_expenses' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'fixed_expenses'
ORDER BY ordinal_position;

SELECT 
  'accounts_receivable' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'accounts_receivable'
ORDER BY ordinal_position;
