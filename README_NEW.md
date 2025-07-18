# Dashboard de Finanzas Personal 💰

Un dashboard completo para gestionar tus finanzas personales con funcionalidades avanzadas de gastos fijos y cuentas por cobrar.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas
- **Gestión de Transacciones**: Registro de ingresos y gastos
- **Dashboard Interactivo**: Gráficos y estadísticas en tiempo real
- **Gastos Mensuales Fijos**: 
  - Registro de gastos recurrentes (alquiler, servicios, membresías)
  - Checkboxes para marcar como pagado
  - Descuento automático del balance al marcar como pagado
  - Alertas de vencimiento y recordatorios
- **Cuentas por Cobrar**: 
  - Registro de dinero que te deben
  - Seguimiento de deudores y fechas esperadas
  - Suma automática al balance al marcar como cobrado
  - Estado de pagos y historial
- **Diseño Responsivo**: Optimizado para móvil y escritorio
- **Persistencia de Datos**: Todo guardado en Supabase

### 🎯 Módulos Principales

1. **📊 Dashboard Principal**
   - Tarjetas de estadísticas (ingresos, gastos, balance)
   - Gráficos de tendencias
   - Lista de transacciones recientes

2. **🏠 Gastos Fijos Mensuales**
   - Formulario para agregar gastos recurrentes
   - Lista con checkboxes para marcar como pagado
   - Cálculo automático de días hasta vencimiento
   - Alertas para gastos vencidos o próximos a vencer

3. **💼 Cuentas por Cobrar**
   - Registro de personas/entidades que te deben dinero
   - Seguimiento de fechas esperadas de pago
   - Checkboxes para marcar como cobrado
   - Total pendiente por cobrar

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: Tailwind CSS, Headless UI
- **Base de Datos**: Supabase (PostgreSQL)
- **Gráficos**: Chart.js, React-Chart.js-2
- **Iconos**: Heroicons, Lucide React
- **Deployment**: Vercel

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratuita)
- Cuenta de Vercel (opcional, para deployment)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/dashboard.git
cd dashboard
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Ve a **Settings > API** y copia:
   - `Project URL`
   - `anon public` key

### 4. Configurar variables de entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local con tus credenciales de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

### 5. Ejecutar migraciones de base de datos

1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Ejecuta el contenido del archivo `database/schema.sql`

### 6. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### `users`
- Gestión de usuarios del sistema

#### `transactions`
- Registro de todas las transacciones (ingresos/gastos)

#### `fixed_expenses` ✨ NUEVO
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- name: VARCHAR(200) - Nombre del gasto
- amount: DECIMAL(10,2) - Monto
- description: TEXT - Descripción opcional
- due_day: INTEGER - Día del mes de vencimiento (1-31)
- is_paid: BOOLEAN - Estado de pago
- last_paid_date: DATE - Última fecha de pago
- created_at: TIMESTAMP
```

#### `accounts_receivable` ✨ NUEVO
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- debtor_name: VARCHAR(200) - Nombre del deudor
- amount: DECIMAL(10,2) - Monto adeudado
- reason: TEXT - Motivo de la deuda
- expected_date: DATE - Fecha esperada de pago
- is_paid: BOOLEAN - Estado de cobro
- paid_date: DATE - Fecha de pago
- created_at: TIMESTAMP
```

## 📱 Uso de la Aplicación

### Inicio de Sesión
1. Ingresa tu nombre y email
2. El sistema creará automáticamente tu perfil

### Gestión de Gastos Fijos
1. Haz clic en **"Agregar"** en la sección "Gastos Mensuales Fijos"
2. Completa el formulario:
   - Nombre (ej: "Alquiler", "Netflix")
   - Monto
   - Día de vencimiento (1-31)
   - Descripción opcional
3. El gasto aparecerá en la lista con indicadores de estado:
   - 🟢 Verde: Pagado
   - 🟡 Amarillo: Vence pronto (≤3 días)
   - 🔴 Rojo: Vencido
4. Marca el checkbox cuando pagues - se creará automáticamente una transacción

### Gestión de Cuentas por Cobrar
1. Haz clic en **"Agregar"** en la sección "Cuentas por Cobrar"
2. Completa el formulario:
   - Nombre del deudor
   - Monto adeudado
   - Motivo/concepto
   - Fecha esperada (opcional)
3. Marca el checkbox cuando te paguen - se sumará automáticamente al balance

## 🎨 Características de Diseño

- **Responsive**: Se adapta perfectamente a móviles y tablets
- **Colores Intuitivos**: Verde para ingresos, rojo para gastos
- **Alertas Visuales**: Códigos de color para vencimientos
- **Animaciones Suaves**: Transiciones CSS para mejor UX
- **Iconografía Consistente**: Heroicons para elementos UI

## 🚀 Deployment en Vercel

### Opción 1: Deploy Automático
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático

### Opción 2: Deploy Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Redeploy
vercel --prod
```

## 📊 Funcionalidades Avanzadas

### Sistema de Alertas
- **Gastos Vencidos**: Destacados en rojo
- **Próximos a Vencer**: Amarillo (≤3 días)
- **Cuentas por Cobrar Vencidas**: Seguimiento de pagos atrasados

### Transacciones Automáticas
- Al marcar un gasto fijo como pagado → Se crea transacción de gasto
- Al marcar una cuenta por cobrar como cobrada → Se crea transacción de ingreso
- Actualización automática del balance general

### Cálculos Inteligentes
- Balance total actualizado en tiempo real
- Totales por categoría
- Proyecciones de gastos mensuales
- Análisis de flujo de efectivo

## 🔧 Personalización

### Modificar Categorías
Edita el archivo `components/TransactionForm.tsx` para agregar nuevas categorías de ingresos/gastos.

### Cambiar Temas
Los colores están definidos en `tailwind.config.js`. Puedes personalizar:
- Colores primarios
- Esquemas de color
- Espaciado y tipografía

## 🐛 Solución de Problemas

### Error de Conexión a Supabase
1. Verifica que las variables de entorno estén correctas
2. Confirma que el proyecto de Supabase esté activo
3. Revisa que las tablas estén creadas correctamente

### Problemas de Build
```bash
# Limpiar cache
rm -rf .next
npm install
npm run build
```

### Errores de TypeScript
```bash
# Verificar tipos
npm run lint
npx tsc --noEmit
```

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa la documentación
2. Busca en Issues existentes
3. Crea un nuevo Issue con detalles del problema

## 🔮 Próximas Funcionalidades

- [ ] Reportes en PDF
- [ ] Notificaciones push
- [ ] Importación de datos bancarios
- [ ] Categorías personalizables
- [ ] Multi-usuario (familias)
- [ ] API REST completa
- [ ] Modo oscuro
- [ ] Backup automático

---

**¡Disfruta gestionando tus finanzas de manera inteligente! 💰📈**
