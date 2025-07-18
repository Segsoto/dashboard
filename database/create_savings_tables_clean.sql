-- Script para agregar SOLO las tablas de ahorros (manejo de errores)
-- Ejecutar este script en el SQL Editor de Supabase

-- Eliminar tablas si existen (para empezar limpio)
DROP TABLE IF EXISTS savings_transactions CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;

-- Eliminar función si existe
DROP FUNCTION IF EXISTS update_savings_goal_amount() CASCADE;

-- Crear tabla de metas de ahorro
CREATE TABLE savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(10,2) DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transacciones de ahorro
CREATE TABLE savings_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  savings_goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_is_completed ON savings_goals(is_completed);
CREATE INDEX idx_savings_transactions_user_id ON savings_transactions(user_id);
CREATE INDEX idx_savings_transactions_goal_id ON savings_transactions(savings_goal_id);
CREATE INDEX idx_savings_transactions_date ON savings_transactions(date);

-- Habilitar RLS
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;

-- Crear políticas
CREATE POLICY "Allow all operations on savings_goals" ON savings_goals FOR ALL USING (true);
CREATE POLICY "Allow all operations on savings_transactions" ON savings_transactions FOR ALL USING (true);

-- Función para actualizar montos automáticamente
CREATE OR REPLACE FUNCTION update_savings_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE savings_goals 
  SET 
    current_amount = (
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
    )
  WHERE id = COALESCE(NEW.savings_goal_id, OLD.savings_goal_id);
  
  -- Actualizar estado de completado
  UPDATE savings_goals 
  SET is_completed = (current_amount >= target_amount)
  WHERE id = COALESCE(NEW.savings_goal_id, OLD.savings_goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trigger_update_savings_goal_amount
  AFTER INSERT OR UPDATE OR DELETE ON savings_transactions
  FOR EACH ROW EXECUTE FUNCTION update_savings_goal_amount();

-- Verificar que todo se creó correctamente
SELECT 'SUCCESS: Tablas de ahorros creadas correctamente' as resultado;

-- Mostrar estructura de las tablas
SELECT 
  'savings_goals' as tabla,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'savings_goals'
ORDER BY ordinal_position;

SELECT 
  'savings_transactions' as tabla,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'savings_transactions'
ORDER BY ordinal_position;
