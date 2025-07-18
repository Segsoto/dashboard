# 💰 Módulo de Ahorros - Documentación

## ✨ **Funcionalidades Implementadas**

### 🎯 **Gestión de Metas de Ahorro**
- ✅ **Crear metas personalizadas** (vacaciones, emergencias, auto, etc.)
- ✅ **Establecer montos objetivo** y fechas límite
- ✅ **Seguimiento automático del progreso** con barras visuales
- ✅ **Marcado automático de metas completadas**
- ✅ **Descripción detallada** para cada meta

### 💸 **Movimientos de Ahorro**
- ✅ **Depósitos** para agregar dinero a tus metas
- ✅ **Retiros** cuando necesites usar los ahorros
- ✅ **Validación automática** (no puedes retirar más de lo que tienes)
- ✅ **Historial completo** de todos los movimientos
- ✅ **Integración con balance general** del dashboard

### 📊 **Estadísticas y Visualizaciones**
- ✅ **Total ahorrado** en todas las metas
- ✅ **Contador de metas activas** y completadas
- ✅ **Meta más cercana a completar** destacada
- ✅ **Barras de progreso** con porcentajes exactos
- ✅ **Historial reciente** de movimientos por meta

---

## 🚀 **Cómo Usar el Módulo**

### 1. **Crear una Nueva Meta de Ahorro**
1. Haz clic en **"+ Nueva Meta"**
2. Completa:
   - **Nombre**: Ej. "Vacaciones 2025", "Fondo de emergencia"
   - **Meta (₡)**: Cantidad que quieres ahorrar
   - **Descripción**: Detalles opcionales
   - **Fecha objetivo**: Opcional, para motivación
3. Haz clic en **"Crear Meta"**

### 2. **Agregar Dinero a una Meta (Depositar)**
1. Haz clic en **"💸 Movimiento"**
2. Selecciona la meta de ahorro
3. Escoge **"💰 Depositar (ahorrar)"**
4. Ingresa el monto que quieres ahorrar
5. Opcionalmente agrega una descripción
6. Haz clic en **"Depositar"**

**🔄 Efecto automático:**
- ➖ Se resta del balance general
- ➕ Se suma a la meta de ahorro
- 📈 Se actualiza el progreso automáticamente

### 3. **Retirar Dinero de una Meta**
1. Haz clic en **"💸 Movimiento"**
2. Selecciona la meta de ahorro
3. Escoge **"💸 Retirar"**
4. Ingresa el monto (no puede ser mayor a lo ahorrado)
5. Agrega el motivo del retiro
6. Haz clic en **"Retirar"**

**🔄 Efecto automático:**
- ➕ Se suma al balance general
- ➖ Se resta de la meta de ahorro
- 📉 Se actualiza el progreso

---

## 🗃️ **Estructura de Base de Datos**

### **Tabla: `savings_goals`**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- name: VARCHAR(255) - Nombre de la meta
- target_amount: DECIMAL(10,2) - Monto objetivo
- current_amount: DECIMAL(10,2) - Monto actual ahorrado
- description: TEXT - Descripción opcional
- target_date: DATE - Fecha objetivo opcional
- is_completed: BOOLEAN - Si la meta está completada
- created_at: TIMESTAMP - Fecha de creación
```

### **Tabla: `savings_movements`**
```sql
- id: UUID (Primary Key)
- savings_goal_id: UUID (Foreign Key → savings_goals.id)
- user_id: UUID (Foreign Key → users.id)
- type: VARCHAR(10) - 'deposit' o 'withdrawal'
- amount: DECIMAL(10,2) - Monto del movimiento
- description: TEXT - Descripción opcional
- date: DATE - Fecha del movimiento
- created_at: TIMESTAMP - Fecha de creación
```

---

## ⚡ **Instalación y Configuración**

### **Paso 1: Ejecutar Migración de Base de Datos**
1. Ve a [Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega el contenido de `database/savings_migration.sql`
5. Haz clic en **"RUN"**

### **Paso 2: Verificar Instalación**
1. Inicia el proyecto: `npm run dev`
2. Ve al dashboard
3. Deberías ver el módulo **"💰 Ahorros"** junto a los otros módulos
4. Si ves un error, verifica que ejecutaste la migración correctamente

---

## 🎨 **Características Visuales**

### **Indicadores de Estado**
- 🟢 **Verde**: Metas completadas
- 🔵 **Azul**: Metas en progreso
- 🟡 **Amarillo**: Meta más cercana a completar
- ⭐ **Estrella**: Meta destacada por progreso

### **Barras de Progreso**
- 📊 **Progreso visual** con porcentajes exactos
- 🎯 **Cambio de color** automático al completar
- 📈 **Animaciones suaves** en actualizaciones

### **Estadísticas Destacadas**
- 💚 **Total Ahorrado**: Suma de todos los ahorros
- 🔵 **Metas Activas**: Metas sin completar
- 💜 **Metas Completadas**: Metas logradas

---

## 🔧 **Funcionalidades Técnicas**

### **Validaciones Automáticas**
- ✅ No puedes retirar más dinero del que tienes ahorrado
- ✅ Los montos deben ser positivos
- ✅ Campos requeridos validados
- ✅ Verificación de existencia de tablas

### **Integración con Balance**
- 🔄 **Sincronización automática** con el balance general
- ➕ **Depósitos** restan del balance principal
- ➖ **Retiros** suman al balance principal
- 📊 **Estadísticas actualizadas** en tiempo real

### **Optimizaciones de Rendimiento**
- 🚀 **Índices de base de datos** para consultas rápidas
- 💾 **Carga eficiente** de datos relacionados
- 🔄 **Actualizaciones optimizadas** del estado

---

## 🎯 **Casos de Uso Comunes**

### **Fondo de Emergencia**
```
Meta: ₡500,000
Depósitos mensuales: ₡50,000
Tiempo estimado: 10 meses
```

### **Vacaciones**
```
Meta: ₡800,000
Fecha objetivo: Diciembre 2025
Depósitos: ₡66,667/mes
```

### **Auto Nuevo**
```
Meta: ₡3,000,000
Ahorros variables según ingresos
Seguimiento a largo plazo
```

---

## 🆘 **Solución de Problemas**

### **Error: "Las tablas de ahorros no existen"**
**Solución:**
1. Ve a Supabase SQL Editor
2. Ejecuta `database/savings_migration.sql`
3. Recarga la página

### **No se actualiza el balance general**
**Solución:**
1. Verifica que la función `onBalanceChange` esté conectada
2. Revisa la consola del navegador por errores
3. Asegúrate de que las transacciones se estén guardando

### **Error al crear meta o movimiento**
**Solución:**
1. Verifica tu conexión a internet
2. Revisa las credenciales de Supabase
3. Consulta los logs en la consola del navegador

---

## 🎉 **¡Felicidades!**

Has implementado exitosamente el **Módulo de Ahorros** en tu dashboard financiero. Ahora puedes:

- 📈 **Establecer y seguir metas de ahorro**
- 💰 **Gestionar depósitos y retiros**
- 📊 **Visualizar tu progreso financiero**
- 🎯 **Mantener el control de tus objetivos**

**💡 Próximos pasos sugeridos:**
- Establecer metas realistas basadas en tus ingresos
- Crear un plan de ahorro mensual
- Usar las estadísticas para mejorar tus hábitos financieros
