'use client'

import { useState, useEffect } from 'react'
import { supabase, User, FixedExpense, Transaction } from '@/lib/supabase'
import { PlusIcon, TrashIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

interface FixedExpensesProps {
  user: User
  onBalanceUpdate: () => void
}

export default function FixedExpenses({ user, onBalanceUpdate }: FixedExpensesProps) {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    due_day: ''
  })

  // Cargar gastos fijos
  const loadFixedExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('due_day', { ascending: true })

      if (error) throw error
      setFixedExpenses(data || [])
    } catch (error) {
      console.error('Error cargando gastos fijos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFixedExpenses()
  }, [user.id])

  // Agregar nuevo gasto fijo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.amount || !formData.due_day) {
      alert('Por favor completa todos los campos requeridos')
      return
    }
    
    try {
      const { error } = await supabase
        .from('fixed_expenses')
        .insert([{
          user_id: user.id,
          name: formData.name,
          amount: parseFloat(formData.amount),
          description: formData.description || null,
          due_day: parseInt(formData.due_day)
        }])

      if (error) {
        console.error('Error agregando gasto fijo:', error)
        alert('Error al agregar el gasto fijo. Por favor intenta de nuevo.')
        return
      }

      setFormData({ name: '', amount: '', description: '', due_day: '' })
      setShowForm(false)
      await loadFixedExpenses()
      alert('Gasto fijo agregado exitosamente!')
    } catch (error) {
      console.error('Error agregando gasto fijo:', error)
      alert('Error al agregar el gasto fijo. Por favor intenta de nuevo.')
    }
  }

  // Marcar como pagado y crear transacción
  const markAsPaid = async (expense: FixedExpense) => {
    try {
      // Actualizar el gasto fijo
      const { error: updateError } = await supabase
        .from('fixed_expenses')
        .update({
          is_paid: true,
          last_paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', expense.id)

      if (updateError) {
        console.error('Error actualizando gasto fijo:', updateError)
        alert('Error al marcar como pagado. Por favor intenta de nuevo.')
        return
      }

      // Crear transacción automática
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'expense',
          amount: expense.amount,
          category: 'Gastos Fijos',
          description: `Pago de ${expense.name}`,
          date: new Date().toISOString().split('T')[0]
        }])

      if (transactionError) {
        console.error('Error creando transacción:', transactionError)
        // No fallar completamente si la transacción falla
      }

      await loadFixedExpenses()
      onBalanceUpdate() // Actualizar balance en el dashboard principal
    } catch (error) {
      console.error('Error marcando como pagado:', error)
      alert('Error al procesar el pago. Por favor intenta de nuevo.')
    }
  }

  // Marcar como no pagado
  const markAsUnpaid = async (expense: FixedExpense) => {
    try {
      const { error } = await supabase
        .from('fixed_expenses')
        .update({
          is_paid: false,
          last_paid_date: null
        })
        .eq('id', expense.id)

      if (error) {
        console.error('Error marcando como no pagado:', error)
        alert('Error al desmarcar el pago. Por favor intenta de nuevo.')
        return
      }

      await loadFixedExpenses()
    } catch (error) {
      console.error('Error marcando como no pagado:', error)
      alert('Error al desmarcar el pago. Por favor intenta de nuevo.')
    }
  }

  // Eliminar gasto fijo
  const deleteExpense = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto fijo?')) return

    try {
      const { error } = await supabase
        .from('fixed_expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadFixedExpenses()
    } catch (error) {
      console.error('Error eliminando gasto fijo:', error)
    }
  }

  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    let dueDate = new Date(currentYear, currentMonth, dueDay)
    
    // Si ya pasó este mes, calcular para el próximo mes
    if (dueDay < currentDay) {
      dueDate = new Date(currentYear, currentMonth + 1, dueDay)
    }
    
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <CurrencyDollarIcon className="h-6 w-6 mr-2 text-red-500" />
          Gastos Mensuales Fijos
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Agregar
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del gasto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ej. Alquiler, Internet, Netflix"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="₡0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Día de vencimiento *
              </label>
              <select
                required
                value={formData.due_day}
                onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar día</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Día {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detalles adicionales"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {fixedExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay gastos fijos registrados. Agrega tu primer gasto fijo para comenzar.
          </p>
        ) : (
          fixedExpenses.map((expense) => {
            const daysUntilDue = getDaysUntilDue(expense.due_day)
            const isOverdue = daysUntilDue < 0 && !expense.is_paid
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0 && !expense.is_paid

            return (
              <div
                key={expense.id}
                className={`border rounded-lg p-4 ${
                  expense.is_paid
                    ? 'bg-green-50 border-green-200'
                    : isOverdue
                    ? 'bg-red-50 border-red-200'
                    : isDueSoon
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={expense.is_paid}
                      onChange={() =>
                        expense.is_paid ? markAsUnpaid(expense) : markAsPaid(expense)
                      }
                      className="h-5 w-5 text-green-600 rounded"
                    />
                    <div>
                      <h3 className={`font-medium ${
                        expense.is_paid ? 'text-green-700 line-through' : 'text-gray-900'
                      }`}>
                        {expense.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ₡{expense.amount.toFixed(2)} • Vence día {expense.due_day}
                      </p>
                      {expense.description && (
                        <p className="text-sm text-gray-400">{expense.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      {expense.is_paid ? (
                        <span className="text-sm text-green-600 font-medium">✓ Pagado</span>
                      ) : (
                        <span className={`text-sm font-medium ${
                          isOverdue
                            ? 'text-red-600'
                            : isDueSoon
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}>
                          {isOverdue
                            ? `Vencido hace ${Math.abs(daysUntilDue)} días`
                            : daysUntilDue === 0
                            ? 'Vence hoy'
                            : `Faltan ${daysUntilDue} días`
                          }
                        </span>
                      )}
                      {expense.last_paid_date && (
                        <p className="text-xs text-gray-400">
                          Último pago: {new Date(expense.last_paid_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {fixedExpenses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total gastos fijos pendientes:</span>
            <span className="font-medium">
              ₡{fixedExpenses
                .filter(expense => !expense.is_paid)
                .reduce((sum, expense) => sum + expense.amount, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
