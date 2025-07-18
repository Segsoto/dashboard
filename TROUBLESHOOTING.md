# 🔍 DIAGNÓSTICO Y SOLUCIÓN DE ERRORES

## ❌ **Error que estás viendo:**
```
Error al agregar gasto fijo. Por favor, intenta de nuevo.
Error al agregar cuenta por cobrar. Por favor, intenta de nuevo.
```

## 🔍 **Causa del Problema:**
Las nuevas tablas (`fixed_expenses`, `fixed_expense_payments`, `accounts_receivable`) **NO EXISTEN** en tu base de datos de Supabase.

## ✅ **SOLUCIÓN PASO A PASO:**

### 1. 🗄️ **Ejecutar Script de Migración:**

1. Ve a tu proyecto en **https://app.supabase.com**
2. Ve a **SQL Editor** en el panel lateral
3. Copia **TODO** el contenido del archivo `database/migration_new_tables.sql`
4. Pégalo en el SQL Editor
5. Haz click en **RUN** (▶️)
6. Verifica que aparezca: "Success. No rows returned"

### 2. 🔍 **Verificar que las Tablas se Crearon:**

Ejecuta esta consulta en SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('fixed_expenses', 'fixed_expense_payments', 'accounts_receivable');
```

**Deberías ver:**
```
fixed_expenses
fixed_expense_payments  
accounts_receivable
```

### 3. 🔄 **Reiniciar la Aplicación:**

1. En la terminal donde tienes `npm run dev`
2. Presiona `Ctrl+C` para parar
3. Ejecuta `npm run dev` nuevamente
4. Ve a `http://localhost:3000`

### 4. ✅ **Probar los Nuevos Módulos:**

1. Inicia sesión en tu dashboard
2. Intenta agregar un gasto fijo
3. Intenta agregar una cuenta por cobrar
4. Deberías ver el mensaje: "agregado exitosamente"

---

## 🚨 **Si Sigues Teniendo Problemas:**

### Verifica las Variables de Entorno:
```bash
# En tu archivo .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Verifica la Conexión en Browser DevTools:
1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Intenta agregar un gasto fijo
4. Ve si aparece un error específico

### Verifica en Supabase Dashboard:
1. Ve a **Table Editor** en Supabase
2. Deberías ver las tablas: `users`, `transactions`, `fixed_expenses`, `fixed_expense_payments`, `accounts_receivable`

---

## 📋 **Checklist de Verificación:**

- [ ] ✅ Proyecto de Supabase activo
- [ ] ✅ Variables de entorno configuradas en `.env.local`
- [ ] ✅ Script `migration_new_tables.sql` ejecutado
- [ ] ✅ Tablas nuevas visibles en Table Editor
- [ ] ✅ Aplicación reiniciada con `npm run dev`
- [ ] ✅ No hay errores en la consola del browser

---

## 🎯 **Una vez solucionado:**

Podrás usar todas las funcionalidades:
- ✅ Agregar gastos fijos mensuales
- ✅ Marcar como pagado → descuenta del balance
- ✅ Agregar cuentas por cobrar  
- ✅ Marcar como cobrado → suma al balance
- ✅ Ver estadísticas actualizadas automáticamente

---

**¡Sigue estos pasos y todo funcionará perfectamente!** 🚀
