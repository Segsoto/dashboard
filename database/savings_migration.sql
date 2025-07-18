-- ====================================================
-- MIGRACIÓN PARA MÓDULO DE AHORROS
-- ====================================================
-- Ejecuta este script en Supabase SQL Editor si solo 
-- necesitas agregar las tablas de ahorros

-- Crear tabla de metas de ahorro
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(10,2) DEFAULT 0 CHECK (current_amount >= 0),
  description TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de movimientos de ahorro
CREATE TABLE IF NOT EXISTS savings_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  savings_goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_is_completed ON savings_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_savings_movements_user_id ON savings_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_movements_goal_id ON savings_movements(savings_goal_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_movements ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas
CREATE POLICY "Allow all operations on savings_goals" ON savings_goals
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on savings_movements" ON savings_movements
  FOR ALL USING (true);
