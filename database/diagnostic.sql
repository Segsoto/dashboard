-- ====================================================
-- SCRIPT DE VERIFICACIÓN Y DIAGNÓSTICO
-- ====================================================
-- Ejecuta estas consultas una por una para diagnosticar problemas

-- 1. Verificar si la tabla 'users' existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'users';

-- 2. Verificar si las tablas de ahorros existen
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name IN ('savings_goals', 'savings_movements');

-- 3. Verificar que el usuario por defecto existe
SELECT * FROM users WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- 4. Si no existe el usuario, crearlo
INSERT INTO users (id, name, email) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Usuario Demo', 'demo@ejemplo.com')
ON CONFLICT (id) DO NOTHING;

-- 5. Verificar estructura de la tabla savings_goals
\d savings_goals;

-- 6. Probar insertar una meta de ahorro simple
INSERT INTO savings_goals (
  user_id, 
  name, 
  target_amount, 
  current_amount, 
  description
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Meta',
  100000.00,
  0.00,
  'Meta de prueba'
);

-- 7. Verificar que se insertó
SELECT * FROM savings_goals WHERE name = 'Test Meta';

-- 8. Limpiar la prueba
DELETE FROM savings_goals WHERE name = 'Test Meta';
