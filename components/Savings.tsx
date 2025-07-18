'use client'

import { useState, useEffect } from 'react'
import { supabase, SavingsGoal, SavingsMovement } from '@/lib/supabase'

interface SavingsProps {
  onBalanceChange: (amount: number, operation: 'add' | 'subtract') => void
}

export default function Savings({ onBalanceChange }: SavingsProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [movements, setMovements] = useState<SavingsMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewGoalForm, setShowNewGoalForm] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [showMovementForm, setShowMovementForm] = useState(false)

  // Form states
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    description: '',
    target_date: ''
  })

  const [newMovement, setNewMovement] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: ''
  })

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Cargando datos de ahorros...')
      
      // Cargar metas de ahorro
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', '123e4567-e89b-12d3-a456-426614174000') // Usuario por defecto
        .order('created_at', { ascending: false })

      if (goalsError) {
        console.error('❌ Error cargando metas:', goalsError)
        
        if (goalsError.message.includes('does not exist') || goalsError.code === '42P01') {
          setError('⚠️ Las tablas de ahorros no existen en tu base de datos.\n\n📋 SOLUCIÓN:\n1. Ve a https://app.supabase.com\n2. Selecciona tu proyecto\n3. Ve a SQL Editor\n4. Copia el contenido de database/savings_migration.sql\n5. Pégalo y haz clic en RUN')
          return
        }
        
        setError(`❌ Error cargando metas: ${goalsError.message}`)
        return
      }

      // Cargar movimientos de ahorro
      const { data: movementsData, error: movementsError } = await supabase
        .from('savings_movements')
        .select('*')
        .eq('user_id', '123e4567-e89b-12d3-a456-426614174000')
        .order('created_at', { ascending: false })

      if (movementsError) {
        console.error('❌ Error cargando movimientos:', movementsError)
        
        if (movementsError.message.includes('does not exist') || movementsError.code === '42P01') {
          setError('⚠️ Las tablas de ahorros no existen. Ejecuta la migración de la base de datos primero.')
          return
        }
        
        setError(`❌ Error cargando movimientos: ${movementsError.message}`)
        return
      }

      console.log('✅ Datos cargados:', { goals: goalsData?.length, movements: movementsData?.length })
      
      setGoals(goalsData || [])
      setMovements(movementsData || [])
      setError(null)
    } catch (err) {
      console.error('💥 Error inesperado cargando ahorros:', err)
      setError(`Error inesperado: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newGoal.name || !newGoal.target_amount) {
      setError('Nombre y meta son requeridos')
      return
    }

    try {
      const goalData = {
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target_amount),
        description: newGoal.description || null,
        target_date: newGoal.target_date || null,
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        current_amount: 0,
        is_completed: false
      }

      console.log('📊 Intentando crear meta de ahorro:', goalData)

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([goalData])
        .select()

      if (error) {
        console.error('❌ Error detallado:', error)
        
        // Mensajes específicos para diferentes tipos de errores
        if (error.code === '42P01') {
          setError('🚨 Tabla "savings_goals" no existe. Ejecuta la migración de base de datos primero.\n\nVe a Supabase → SQL Editor → Ejecuta savings_migration.sql')
          return
        }
        
        if (error.code === '23503') {
          setError('🚨 El usuario no existe en la base de datos. Verifica la configuración.')
          return
        }
        
        if (error.message.includes('violates check constraint')) {
          setError('🚨 El monto debe ser mayor a 0')
          return
        }
        
        setError(`❌ Error creando meta: ${error.message}\nCódigo: ${error.code}\nDetalles: ${error.details}`)
        return
      }

      console.log('✅ Meta creada exitosamente:', data)
      setNewGoal({ name: '', target_amount: '', description: '', target_date: '' })
      setShowNewGoalForm(false)
      setError(null)
      loadData()
    } catch (err) {
      console.error('💥 Error inesperado:', err)
      setError(`Error inesperado: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedGoal || !newMovement.amount) {
      setError('Selecciona una meta y especifica el monto')
      return
    }

    try {
      const amount = parseFloat(newMovement.amount)
      const goal = goals.find(g => g.id === selectedGoal)
      
      if (!goal) {
        setError('Meta no encontrada')
        return
      }

      // Verificar si hay suficiente dinero para retiro
      if (newMovement.type === 'withdrawal' && amount > goal.current_amount) {
        setError('No puedes retirar más dinero del que tienes ahorrado')
        return
      }

      const movementData = {
        savings_goal_id: selectedGoal,
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        type: newMovement.type,
        amount: amount,
        description: newMovement.description || null,
        date: new Date().toISOString().split('T')[0]
      }

      const { error } = await supabase
        .from('savings_movements')
        .insert([movementData])

      if (error) throw error

      // Actualizar el monto actual en la meta
      const newCurrentAmount = newMovement.type === 'deposit' 
        ? goal.current_amount + amount
        : goal.current_amount - amount

      const isCompleted = newCurrentAmount >= goal.target_amount

      const { error: updateError } = await supabase
        .from('savings_goals')
        .update({ 
          current_amount: newCurrentAmount,
          is_completed: isCompleted 
        })
        .eq('id', selectedGoal)

      if (updateError) throw updateError

      // Actualizar balance general
      if (newMovement.type === 'deposit') {
        onBalanceChange(amount, 'subtract') // Restar del balance porque se va a ahorros
      } else {
        onBalanceChange(amount, 'add') // Sumar al balance porque sale de ahorros
      }

      setNewMovement({ type: 'deposit', amount: '', description: '' })
      setShowMovementForm(false)
      setSelectedGoal(null)
      loadData()
    } catch (err) {
      console.error('Error agregando movimiento:', err)
      setError('Error al agregar el movimiento')
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta meta de ahorro?')) return

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error

      loadData()
    } catch (err) {
      console.error('Error eliminando meta:', err)
      setError('Error al eliminar la meta')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount)
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getTotalSaved = () => {
    return goals.reduce((total, goal) => total + goal.current_amount, 0)
  }

  const getClosestGoal = () => {
    return goals
      .filter(goal => !goal.is_completed)
      .sort((a, b) => getProgressPercentage(b.current_amount, b.target_amount) - getProgressPercentage(a.current_amount, a.target_amount))[0]
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">💰 Ahorros</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">💰 Ahorros</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          {error.includes('migración') && (
            <p className="text-red-600 text-sm mt-2">
              Ve a Supabase → SQL Editor y ejecuta el archivo database/schema.sql
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">💰 Ahorros</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewGoalForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Nueva Meta
          </button>
          <button
            onClick={() => setShowMovementForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            💸 Movimiento
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Total Ahorrado</h3>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(getTotalSaved())}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Metas Activas</h3>
          <p className="text-2xl font-bold text-blue-900">{goals.filter(g => !g.is_completed).length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Metas Completadas</h3>
          <p className="text-2xl font-bold text-purple-900">{goals.filter(g => g.is_completed).length}</p>
        </div>
      </div>

      {/* Meta más cercana */}
      {getClosestGoal() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">🎯 Meta más cercana a completar</h3>
          <div className="flex justify-between items-center">
            <span className="font-medium text-yellow-900">{getClosestGoal().name}</span>
            <span className="text-yellow-700">
              {getProgressPercentage(getClosestGoal().current_amount, getClosestGoal().target_amount).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Lista de metas */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tienes metas de ahorro todavía</p>
            <p className="text-sm">¡Crea tu primera meta para empezar!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className={`border rounded-lg p-4 ${goal.is_completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {goal.name}
                    {goal.is_completed && <span className="ml-2 text-green-600">✅</span>}
                  </h3>
                  {goal.description && (
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  )}
                  {goal.target_date && (
                    <p className="text-xs text-gray-500">
                      Meta: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  🗑️
                </button>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{formatCurrency(goal.current_amount)}</span>
                  <span>{formatCurrency(goal.target_amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${goal.is_completed ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${getProgressPercentage(goal.current_amount, goal.target_amount)}%` }}
                  ></div>
                </div>
                <div className="text-center text-xs text-gray-500 mt-1">
                  {getProgressPercentage(goal.current_amount, goal.target_amount).toFixed(1)}% completado
                </div>
              </div>

              {/* Movimientos de esta meta */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Últimos movimientos:</h4>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {movements
                    .filter(m => m.savings_goal_id === goal.id)
                    .slice(0, 3)
                    .map((movement) => (
                      <div key={movement.id} className="flex justify-between text-xs">
                        <span className={movement.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                          {movement.type === 'deposit' ? '💰' : '💸'} {formatCurrency(movement.amount)}
                        </span>
                        <span className="text-gray-500">{new Date(movement.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nueva Meta */}
      {showNewGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Nueva Meta de Ahorro</h3>
            <form onSubmit={handleCreateGoal}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la meta *
                  </label>
                  <input
                    type="text"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ej: Vacaciones, Auto, Emergencias"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta (₡) *
                  </label>
                  <input
                    type="number"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500000"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detalles sobre tu meta"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha objetivo
                  </label>
                  <input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewGoalForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Crear Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Movimiento */}
      {showMovementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Nuevo Movimiento</h3>
            <form onSubmit={handleAddMovement}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta de ahorro *
                  </label>
                  <select
                    value={selectedGoal || ''}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona una meta</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.name} ({formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de movimiento *
                  </label>
                  <select
                    value={newMovement.type}
                    onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value as 'deposit' | 'withdrawal' })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="deposit">💰 Depositar (ahorrar)</option>
                    <option value="withdrawal">💸 Retirar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto (₡) *
                  </label>
                  <input
                    type="number"
                    value={newMovement.amount}
                    onChange={(e) => setNewMovement({ ...newMovement, amount: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25000"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={newMovement.description}
                    onChange={(e) => setNewMovement({ ...newMovement, description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ahorro del mes, retiro de emergencia, etc."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowMovementForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {newMovement.type === 'deposit' ? 'Depositar' : 'Retirar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
