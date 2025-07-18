# 🚨 Solución: "Error al crear la meta de ahorro"

## 🔍 **Diagnóstico Paso a Paso**

### **Paso 1: Verificar en el navegador**
1. Ve a http://localhost:3001
2. Abre las **herramientas de desarrollador** (F12)
3. Ve a la pestaña **Console**
4. Intenta crear una meta de ahorro
5. Observa los mensajes que aparecen en la consola

### **Paso 2: Verificar en Supabase**
1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Ejecuta esta consulta para verificar si las tablas existen:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('users', 'savings_goals', 'savings_movements');
```

### **Paso 3: Soluciones Comunes**

#### ❌ **Si ves: "savings_goals no existe"**
**Solución:** Ejecutar migración
1. Ve a Supabase → SQL Editor
2. Copia TODO el contenido del archivo `database/savings_migration.sql`
3. Pégalo en el editor
4. Haz clic en **"RUN"**

#### ❌ **Si ves: "user_id no válido"**
**Solución:** Crear usuario por defecto
```sql
INSERT INTO users (id, name, email) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Usuario Demo', 'demo@ejemplo.com')
ON CONFLICT (id) DO NOTHING;
```

#### ❌ **Si ves: "monto debe ser mayor a 0"**
**Solución:** Verificar que ingreses un número válido mayor a 0

#### ❌ **Si ves: "violates check constraint"**
**Solución:** Verificar todos los campos:
- Nombre: No vacío
- Monto: Número mayor a 0
- Fecha (opcional): Formato correcto YYYY-MM-DD

---

## 🛠️ **Script Completo de Reparación**

Si quieres arreglar todo de una vez, ejecuta este script en Supabase SQL Editor:

```sql
-- 1. Verificar/crear usuario por defecto
INSERT INTO users (id, name, email) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Usuario Demo', 'demo@ejemplo.com')
ON CONFLICT (id) DO NOTHING;

-- 2. Crear tablas de ahorros si no existen
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

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_is_completed ON savings_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_savings_movements_user_id ON savings_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_movements_goal_id ON savings_movements(savings_goal_id);

-- 4. Habilitar RLS
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_movements ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas
CREATE POLICY "Allow all operations on savings_goals" ON savings_goals
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on savings_movements" ON savings_movements
  FOR ALL USING (true);

-- 6. Verificar que todo funciona
SELECT 'Tablas creadas exitosamente' as status;
```

---

## 🧪 **Probar la Solución**

Después de ejecutar la reparación:

1. **Recarga la página** del dashboard (F5)
2. **Ve al módulo de ahorros**
3. **Haz clic en "+ Nueva Meta"**
4. **Llena el formulario:**
   - Nombre: "Test Meta"
   - Meta: 100000
   - Descripción: "Prueba"
5. **Haz clic en "Crear Meta"**

Si todo está bien, deberías ver la meta creada exitosamente.

---

## 📞 **Si Sigue Sin Funcionar**

1. **Copia el error exacto** que aparece en la consola del navegador
2. **Envíame los detalles** y te ayudo específicamente
3. **Verifica tu archivo .env.local** que tenga las variables correctas de Supabase

---

## ✅ **Mensaje de Éxito Esperado**

Cuando funcione correctamente, deberías ver:
- ✅ "Meta creada exitosamente" en la consola
- ✅ La nueva meta aparece en la lista
- ✅ No hay mensajes de error
- ✅ La tarjeta "Total Ahorrado" se actualiza
