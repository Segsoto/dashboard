'use client'

import { useState, useEffect } from 'react'
import { supabase, User, SavingsGoal, SavingsTransaction } from '@/lib/supabase'
import { PlusIcon, TrashIcon, BanknotesIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

interface SavingsModuleProps {
  user: User
  onBalanceUpdate: () => void
}

export default function SavingsModule({ user, onBalanceUpdate }: SavingsModuleProps) {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [goalFormData, setGoalFormData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    description: ''
  })
  const [transactionFormData, setTransactionFormData] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: ''
  })

  // Cargar metas de ahorro
  const loadSavingsGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavingsGoals(data || [])
    } catch (error) {
      console.error('Error cargando metas de ahorro:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSavingsGoals()
  }, [user.id])

  // Crear nueva meta de ahorro
  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!goalFormData.name || !goalFormData.target_amount) {
      alert('Por favor completa los campos requeridos')
      return
    }
    
    try {
      const { error } = await supabase
        .from('savings_goals')
        .insert([{
          user_id: user.id,
          name: goalFormData.name,
          target_amount: parseFloat(goalFormData.target_amount),
          target_date: goalFormData.target_date || null,
          description: goalFormData.description || null
        }])

      if (error) {
        console.error('Error creando meta de ahorro:', error)
        alert('Error al crear la meta de ahorro. Por favor intenta de nuevo.')
        return
      }

      setGoalFormData({ name: '', target_amount: '', target_date: '', description: '' })
      setShowGoalForm(false)
      await loadSavingsGoals()
      alert('Meta de ahorro creada exitosamente!')
    } catch (error) {
      console.error('Error creando meta de ahorro:', error)
      alert('Error al crear la meta de ahorro. Por favor intenta de nuevo.')
    }
  }

  // Agregar transacción de ahorro
  const handleTransactionSubmit = async (e: React.FormEvent, goalId: string) => {
    e.preventDefault()
    
    if (!transactionFormData.amount) {
      alert('Por favor ingresa un monto')
      return
    }

    const amount = parseFloat(transactionFormData.amount)
    if (amount <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }
    
    try {
      // Crear transacción de ahorro
      const { error: transactionError } = await supabase
        .from('savings_transactions')
        .insert([{
          user_id: user.id,
          savings_goal_id: goalId,
          type: transactionFormData.type,
          amount: amount,
          description: transactionFormData.description || null,
          date: new Date().toISOString().split('T')[0]
        }])

      if (transactionError) {
        console.error('Error creando transacción de ahorro:', transactionError)
        alert('Error al procesar la transacción de ahorro.')
        return
      }

      // Crear transacción principal (impacta el balance general)
      const transactionType = transactionFormData.type === 'deposit' ? 'expense' : 'income'
      const { error: mainTransactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: transactionType,
          amount: amount,
          category: 'Ahorros',
          description: `${transactionFormData.type === 'deposit' ? 'Depósito en' : 'Retiro de'} ${savingsGoals.find(g => g.id === goalId)?.name || 'ahorro'}`,
          date: new Date().toISOString().split('T')[0]
        }])

      if (mainTransactionError) {
        console.error('Error creando transacción principal:', mainTransactionError)
      }

      setTransactionFormData({ type: 'deposit', amount: '', description: '' })
      setShowTransactionForm(null)
      await loadSavingsGoals()
      onBalanceUpdate()
      alert('Transacción procesada exitosamente!')
    } catch (error) {
      console.error('Error procesando transacción:', error)
      alert('Error al procesar la transacción.')
    }
  }

  // Eliminar meta de ahorro
  const deleteGoal = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta meta de ahorro? Esto también eliminará todas sus transacciones.')) return

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadSavingsGoals()
      alert('Meta de ahorro eliminada exitosamente')
    } catch (error) {
      console.error('Error eliminando meta de ahorro:', error)
      alert('Error al eliminar la meta de ahorro.')
    }
  }

  // Calcular totales
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0)
  const totalTargets = savingsGoals.reduce((sum, goal) => sum + goal.target_amount, 0)
  const completedGoals = savingsGoals.filter(goal => goal.is_completed).length

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <BanknotesIcon className="h-6 w-6 mr-2 text-green-500" />
          Metas de Ahorro
        </h2>
        <button
          onClick={() => setShowGoalForm(!showGoalForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Nueva Meta
        </button>
      </div>

      {/* Resumen de ahorros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Ahorrado</p>
              <p className="text-2xl font-bold text-green-700">${totalSaved.toFixed(2)}</p>
            </div>
            <BanknotesIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Meta Total</p>
              <p className="text-2xl font-bold text-blue-700">${totalTargets.toFixed(2)}</p>
            </div>
            <ArrowUpIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Metas Completadas</p>
              <p className="text-2xl font-bold text-purple-700">{completedGoals}/{savingsGoals.length}</p>
            </div>
            <div className="text-purple-500 text-2xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Formulario para nueva meta */}
      {showGoalForm && (
        <form onSubmit={handleGoalSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Nueva Meta de Ahorro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la meta *
              </label>
              <input
                type="text"
                required
                value={goalFormData.name}
                onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ej. Vacaciones, Emergencias, Auto nuevo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto objetivo *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={goalFormData.target_amount}
                onChange={(e) => setGoalFormData({ ...goalFormData, target_amount: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha objetivo
              </label>
              <input
                type="date"
                value={goalFormData.target_date}
                onChange={(e) => setGoalFormData({ ...goalFormData, target_date: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={goalFormData.description}
                onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detalles de la meta"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Crear Meta
            </button>
            <button
              type="button"
              onClick={() => setShowGoalForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de metas de ahorro */}
      <div className="space-y-4">
        {savingsGoals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay metas de ahorro registradas. Crea tu primera meta para comenzar a ahorrar.
          </p>
        ) : (
          savingsGoals.map((goal) => {
            const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
            const progressColor = progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
            
            return (
              <div
                key={goal.id}
                className={`border rounded-lg p-4 ${
                  goal.is_completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium ${goal.is_completed ? 'text-green-700' : 'text-gray-900'}`}>
                        {goal.name}
                        {goal.is_completed && <span className="ml-2">🎉</span>}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      ${goal.current_amount.toFixed(2)} de ${goal.target_amount.toFixed(2)} 
                      ({progress.toFixed(1)}%)
                    </p>
                    {goal.target_date && (
                      <p className="text-sm text-gray-400">
                        Meta: {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    )}
                    {goal.description && (
                      <p className="text-sm text-gray-400">{goal.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowTransactionForm(showTransactionForm === goal.id ? null : goal.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      💰 Transacción
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>

                {/* Formulario de transacción */}
                {showTransactionForm === goal.id && (
                  <form onSubmit={(e) => handleTransactionSubmit(e, goal.id)} className="bg-gray-50 p-3 rounded-lg mt-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                          value={transactionFormData.type}
                          onChange={(e) => setTransactionFormData({ ...transactionFormData, type: e.target.value as 'deposit' | 'withdrawal' })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="deposit">💰 Depositar</option>
                          <option value="withdrawal">💸 Retirar</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={transactionFormData.amount}
                          onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <input
                          type="text"
                          value={transactionFormData.description}
                          onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        {transactionFormData.type === 'deposit' ? 'Depositar' : 'Retirar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTransactionForm(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
