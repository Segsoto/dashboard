# Personal Finance Dashboard

Un dashboard moderno y responsivo para administrar finanzas personales construido con Next.js, React, y Supabase.

## 🚀 Características

- **Autenticación simple**: Inicio de sesión con nombre y email
- **Gestión de transacciones**: Agregar ingresos y gastos con categorías
- **Visualizaciones**: Gráficos de barras y pastel para analizar finanzas
- **Filtros avanzados**: Filtrar por categoría, fecha, y tipo de transacción
- **Dashboard en tiempo real**: Estadísticas actualizadas automáticamente
- **Diseño responsivo**: Funciona perfectamente en desktop y móvil

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: TailwindCSS
- **Base de datos**: Supabase (PostgreSQL)
- **Gráficos**: Chart.js + React Chart.js 2
- **Despliegue**: Vercel

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <tu-repo-url>
cd dashboard
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.local.example .env.local
```

Edita `.env.local` y agrega tus credenciales de Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

4. Configura la base de datos en Supabase:
   - Ejecuta el script SQL que está en `database/schema.sql` en tu proyecto de Supabase
   - Esto creará todas las tablas y datos iniciales necesarios

5. Ejecuta la aplicación:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

### Tabla `users`
- `id`: UUID (Primary Key)
- `name`: Nombre del usuario
- `email`: Email único del usuario
- `created_at`: Fecha de creación

### Tabla `transactions`
- `id`: UUID (Primary Key)
- `user_id`: Referencia al usuario
- `type`: 'income' o 'expense'
- `amount`: Monto de la transacción
- `category`: Categoría de la transacción
- `description`: Descripción opcional
- `date`: Fecha de la transacción
- `created_at`: Fecha de creación

### Tabla `categories`
- `id`: UUID (Primary Key)
- `name`: Nombre de la categoría
- `type`: 'income' o 'expense'
- `color`: Color en formato HEX
- `created_at`: Fecha de creación

## 💰 Categorías Predeterminadas

### Ingresos
- Salario
- Freelance
- Inversiones
- Bonos
- Otros ingresos

### Gastos
- Comida
- Transporte
- Entretenimiento
- Salud
- Servicios
- Compras
- Otros gastos

## 🔧 Personalización

### Agregar nuevas categorías
Edita el archivo `lib/database.ts` para agregar nuevas categorías:

```typescript
export const categories = {
  income: [
    { name: 'Nueva categoría', color: '#color' },
    // ...
  ],
  expense: [
    { name: 'Nueva categoría', color: '#color' },
    // ...
  ],
}
```

### Cambiar moneda
Edita la función `formatCurrency` en `lib/utils.ts`:

```typescript
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC', // Cambia esto por tu moneda
  }).format(amount)
}
```

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno en la configuración de Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Despliega automáticamente

## 📱 Uso

1. **Inicio de sesión**: Ingresa tu nombre y email para acceder
2. **Agregar transacciones**: Click en "Nueva Transacción" para registrar ingresos o gastos
3. **Ver dashboard**: Revisa tus estadísticas financieras en tiempo real
4. **Filtrar datos**: Usa los filtros para analizar períodos específicos
5. **Visualizar tendencias**: Revisa los gráficos para entender tus patrones de gasto

## 🔒 Reiniciar Datos

Para reiniciar todos los datos de un usuario:

1. Conéctate a tu base de datos Supabase
2. Ejecuta: `DELETE FROM transactions WHERE user_id = 'USER_ID';`
3. O ejecuta: `DELETE FROM users WHERE id = 'USER_ID';` (esto eliminará el usuario y todas sus transacciones)

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que las políticas RLS estén configuradas correctamente

### Problemas con gráficos
- Verifica que tengas transacciones registradas
- Los gráficos solo aparecen cuando hay datos disponibles

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo libremente para proyectos personales o comerciales.
