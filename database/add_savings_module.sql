-- Script para agregar el módulo de ahorros
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear tabla de metas de ahorro
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL, -- Nombre de la meta (ej: "Vacaciones", "Emergencias")
  target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0), -- Cantidad objetivo
  current_amount DECIMAL(10,2) DEFAULT 0 CHECK (current_amount >= 0), -- Cantidad actual
  target_date DATE, -- Fecha objetivo (opcional)
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transacciones de ahorro
CREATE TABLE IF NOT EXISTS savings_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  savings_goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_is_completed ON savings_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_user_id ON savings_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_goal_id ON savings_transactions(savings_goal_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_date ON savings_transactions(date);

-- Habilitar RLS para las nuevas tablas
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para las nuevas tablas
CREATE POLICY "Allow all operations on savings_goals" ON savings_goals
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on savings_transactions" ON savings_transactions
  FOR ALL USING (true);

-- Función para actualizar el monto actual de una meta cuando hay transacciones
CREATE OR REPLACE FUNCTION update_savings_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el monto actual basado en las transacciones
  UPDATE savings_goals 
  SET current_amount = (
    SELECT COALESCE(
      SUM(
        CASE 
          WHEN type = 'deposit' THEN amount 
          WHEN type = 'withdrawal' THEN -amount 
        END
      ), 0
    )
    FROM savings_transactions 
    WHERE savings_goal_id = COALESCE(NEW.savings_goal_id, OLD.savings_goal_id)
  ),
  is_completed = (
    SELECT 
      CASE 
        WHEN current_amount >= target_amount THEN true 
        ELSE false 
      END
    FROM savings_goals 
    WHERE id = COALESCE(NEW.savings_goal_id, OLD.savings_goal_id)
  )
  WHERE id = COALESCE(NEW.savings_goal_id, OLD.savings_goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar automáticamente los montos
CREATE TRIGGER trigger_update_savings_goal_amount
  AFTER INSERT OR UPDATE OR DELETE ON savings_transactions
  FOR EACH ROW EXECUTE FUNCTION update_savings_goal_amount();

-- Verificar que las tablas se crearon correctamente
SELECT 'savings_goals table created' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'savings_goals'
);

SELECT 'savings_transactions table created' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'savings_transactions'
);
