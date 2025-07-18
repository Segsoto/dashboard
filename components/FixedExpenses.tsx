'use client'

import { useState, useEffect } from 'react'
import { supabase, User, FixedExpense, FixedExpensePayment } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { categories } from '@/lib/database'

interface FixedExpensesProps {
  user: User
  onPaymentMade: (amount: number) => void
}

export default function FixedExpenses({ user, onPaymentMade }: FixedExpensesProps) {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [payments, setPayments] = useState<FixedExpensePayment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Formulario
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [dueDay, setDueDay] = useState('')

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Cargar gastos fijos y pagos
  useEffect(() => {
    loadFixedExpenses()
    loadPayments()
  }, [user])

  const loadFixedExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('due_day', { ascending: true })

      if (error) throw error
      setFixedExpenses(data || [])
    } catch (error) {
      console.error('Error cargando gastos fijos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('fixed_expense_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error('Error cargando pagos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .insert([
          {
            user_id: user.id,
            name,
            amount: parseFloat(amount),
            category,
            description: description || null,
            due_day: parseInt(dueDay),
          },
        ])
        .select()
        .single()

      if (error) throw error

      setFixedExpenses([...fixedExpenses, data])
      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error('Error agregando gasto fijo:', error)
      alert('Error al agregar gasto fijo. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async (expense: FixedExpense, isPaid: boolean) => {
    try {
      if (isPaid) {
        // Marcar como pagado
        const { data, error } = await supabase
          .from('fixed_expense_payments')
          .insert([
            {
              fixed_expense_id: expense.id,
              user_id: user.id,
              month: currentMonth,
              year: currentYear,
              paid_amount: expense.amount,
              paid_date: new Date().toISOString().split('T')[0],
            },
          ])
          .select()
          .single()

        if (error) throw error

        setPayments([...payments, data])
        
        // Crear transacción automática
        await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              type: 'expense',
              amount: expense.amount,
              category: expense.category,
              description: `Pago de gasto fijo: ${expense.name}`,
              date: new Date().toISOString().split('T')[0],
            },
          ])

        onPaymentMade(-expense.amount) // Restar del balance
      } else {
        // Desmarcar como pagado
        const { error } = await supabase
          .from('fixed_expense_payments')
          .delete()
          .eq('fixed_expense_id', expense.id)
          .eq('month', currentMonth)
          .eq('year', currentYear)

        if (error) throw error

        setPayments(payments.filter(p => p.fixed_expense_id !== expense.id))
        onPaymentMade(expense.amount) // Sumar al balance
      }
    } catch (error) {
      console.error('Error procesando pago:', error)
      alert('Error al procesar el pago. Por favor, intenta de nuevo.')
    }
  }

  const resetForm = () => {
    setName('')
    setAmount('')
    setCategory('')
    setDescription('')
    setDueDay('')
  }

  const isExpensePaid = (expenseId: string) => {
    return payments.some(p => p.fixed_expense_id === expenseId)
  }

  const getTotalFixed = () => {
    return fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getTotalPaid = () => {
    return payments.reduce((sum, payment) => sum + payment.paid_amount, 0)
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Gastos Mensuales Fijos
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona tus gastos que se repiten cada mes
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            {showForm ? 'Cancelar' : 'Agregar Gasto Fijo'}
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Total Fijos</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(getTotalFixed())}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-600">Pagado</div>
            <div className="text-lg font-semibold text-green-700">
              {formatCurrency(getTotalPaid())}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-red-600">Pendiente</div>
            <div className="text-lg font-semibold text-red-700">
              {formatCurrency(getTotalFixed() - getTotalPaid())}
            </div>
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del gasto
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Alquiler, Netflix, Gimnasio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.expense.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de vencimiento
                </label>
                <select
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona el día</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción adicional..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Gasto Fijo'}
              </button>
            </div>
          </form>
        )}

        {/* Lista de gastos fijos */}
        <div className="space-y-3">
          {fixedExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tienes gastos fijos registrados.
              <br />
              Agrega uno para comenzar a gestionar tus pagos mensuales.
            </div>
          ) : (
            fixedExpenses.map((expense) => {
              const isPaid = isExpensePaid(expense.id)
              return (
                <div
                  key={expense.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    isPaid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => handlePayment(expense, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className={`font-medium ${isPaid ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {expense.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {expense.category} • Vence el día {expense.due_day}
                        {expense.description && ` • ${expense.description}`}
                      </div>
                    </div>
                  </div>
                  <div className={`text-right ${isPaid ? 'text-gray-500' : 'text-gray-900'}`}>
                    <div className="font-semibold">
                      {formatCurrency(expense.amount)}
                    </div>
                    {isPaid && (
                      <div className="text-xs text-green-600">
                        ✓ Pagado
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
