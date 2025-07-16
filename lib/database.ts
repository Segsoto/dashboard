import { supabase } from './supabase'

// Crear las tablas necesarias
export const initializeDatabase = async () => {
  try {
    // Crear tabla de usuarios
    await supabase.rpc('create_users_table', {})
    
    // Crear tabla de transacciones
    await supabase.rpc('create_transactions_table', {})
    
    // Crear categorías predeterminadas
    await supabase.rpc('create_default_categories', {})
    
    console.log('Base de datos inicializada correctamente')
  } catch (error) {
    console.error('Error inicializando la base de datos:', error)
  }
}

export const categories = {
  income: [
    { name: 'Salario', color: '#22c55e' },
    { name: 'Freelance', color: '#3b82f6' },
    { name: 'Inversiones', color: '#8b5cf6' },
    { name: 'Bonos', color: '#06b6d4' },
    { name: 'Otros ingresos', color: '#84cc16' },
  ],
  expense: [
    { name: 'Comida', color: '#ef4444' },
    { name: 'Transporte', color: '#f97316' },
    { name: 'Entretenimiento', color: '#ec4899' },
    { name: 'Salud', color: '#14b8a6' },
    { name: 'Servicios', color: '#6366f1' },
    { name: 'Compras', color: '#f59e0b' },
    { name: 'Otros gastos', color: '#64748b' },
  ],
}
