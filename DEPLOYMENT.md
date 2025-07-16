# 🚀 Guía Rápida de Despliegue

## 📋 Pasos para el Despliegue Completo

### 1. 🗄️ Configurar Supabase

1. Ve a [Supabase](https://app.supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a Settings > API y copia:
   - `Project URL`
   - `Anon public key`
4. Ve a SQL Editor y ejecuta el script completo de `database/schema.sql`

### 2. 🔧 Configurar Variables de Entorno

Edita el archivo `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 3. 🚢 Desplegar en Vercel

#### Opción A: Deploy Automático
1. Conecta tu repositorio GitHub a Vercel
2. Importa este proyecto en Vercel
3. Agrega las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. ¡Despliega!

#### Opción B: Deploy Manual
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 4. ✅ Verificar el Despliegue

1. Accede a tu URL de Vercel
2. Registra un usuario de prueba
3. Agrega algunas transacciones
4. Verifica que las gráficas funcionen

### 5. 🎯 ¡Listo!

Tu dashboard estará disponible en: `https://tu-proyecto.vercel.app`

---

## 🛠️ Comandos de Desarrollo

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## 📊 Datos de Ejemplo

Para probar rápidamente, puedes agregar estas transacciones:

**Ingresos:**
- Salario: $50,000 (enero)
- Freelance: $15,000 (enero)
- Bonos: $5,000 (febrero)

**Gastos:**
- Comida: $8,000 (enero)
- Transporte: $3,000 (enero)
- Entretenimiento: $2,000 (febrero)

## 🔍 Solución de Problemas

### Error de conexión a Supabase
- Verifica las variables de entorno
- Confirma que el proyecto de Supabase esté activo
- Revisa que las tablas estén creadas

### Gráficos no aparecen
- Asegúrate de tener transacciones registradas
- Verifica la consola del navegador por errores

### Problemas de build
- Ejecuta `npm run build` localmente primero
- Verifica que todas las dependencias estén instaladas

---

## 🎉 ¡Tu Dashboard está Listo!

Ahora puedes:
- ✅ Gestionar tus finanzas desde cualquier lugar
- ✅ Ver gráficas en tiempo real
- ✅ Filtrar y analizar tus gastos
- ✅ Acceder desde cualquier dispositivo
