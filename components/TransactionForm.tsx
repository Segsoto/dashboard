'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { categories } from '@/lib/database'
import { User, Transaction } from '@/lib/supabase'

interface TransactionFormProps {
  user: User
  onTransactionAdded: (transaction: Transaction) => void
  onClose: () => void
  currentBalance: number
}

export default function TransactionForm({ user, onTransactionAdded, onClose, currentBalance }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)

  // Función para formatear números con comas
  const formatNumberWithCommas = (value: string): string => {
    const cleaned = value.replace(/[^\d.]/g, '')
    const parts = cleaned.split('.')
    const wholePart = parts[0]
    const decimalPart = parts[1] ? '.' + parts[1].slice(0, 2) : ''
    const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return formattedWhole + decimalPart
  }

  // Función para obtener valor numérico sin formato
  const getNumericValue = (formattedValue: string): number => {
    return parseFloat(formattedValue.replace(/,/g, '')) || 0
  }

  // Manejar cambio en campo de dinero con formato
  const handleAmountChange = (value: string) => {
    const formatted = formatNumberWithCommas(value)
    setAmount(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const numericAmount = getNumericValue(amount)
    
    // Validar que el monto sea mayor a 0
    if (numericAmount <= 0) {
      alert('El monto debe ser mayor a 0.')
      setIsLoading(false)
      return
    }

    // Validar que hay suficiente dinero para gastos
    if (type === 'expense' && numericAmount > currentBalance) {
      alert(`No tienes suficiente dinero para este gasto. Balance actual: ₡${currentBalance.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      setIsLoading(false)
      return
    }

    try {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type,
            amount: numericAmount,
            category,
            description: description || null,
            date,
          },
        ])
        .select()
        .single()

      if (error) throw error

      onTransactionAdded(transaction)
      onClose()
    } catch (error) {
      console.error('Error al agregar transacción:', error)
      alert('Error al agregar transacción. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const availableCategories = type === 'income' ? categories.income : categories.expense

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Nueva Transacción
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Indicador de balance disponible */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Balance disponible:</span> ₡{currentBalance.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="income"
                    checked={type === 'income'}
                    onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                    className="mr-2"
                  />
                  <span className="text-green-600">Ingreso</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="expense"
                    checked={type === 'expense'}
                    onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                    className="mr-2"
                  />
                  <span className="text-red-600">Gasto</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto
              </label>
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="₡0.00"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecciona una categoría</option>
                {availableCategories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descripción de la transacción..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
