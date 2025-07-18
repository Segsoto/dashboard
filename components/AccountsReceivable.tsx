'use client'

import { useState, useEffect } from 'react'
import { supabase, User, AccountReceivable } from '@/lib/supabase'
import { PlusIcon, TrashIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline'

interface AccountsReceivableProps {
  user: User
  onBalanceUpdate: () => void
}

export default function AccountsReceivable({ user, onBalanceUpdate }: AccountsReceivableProps) {
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    debtor_name: '',
    amount: '',
    reason: '',
    expected_date: ''
  })

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
    setFormData(prev => ({ ...prev, amount: formatted }))
  }

  // Cargar cuentas por cobrar
  const loadAccountsReceivable = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('user_id', user.id)
        .order('expected_date', { ascending: true })

      if (error) throw error
      setAccountsReceivable(data || [])
    } catch (error) {
      console.error('Error cargando cuentas por cobrar:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccountsReceivable()
  }, [user.id])

  // Agregar nueva cuenta por cobrar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.debtor_name || !formData.amount || !formData.reason) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    const amount = getNumericValue(formData.amount)
    if (amount <= 0) {
      alert('El monto debe ser mayor a 0.')
      return
    }
    
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .insert([{
          user_id: user.id,
          debtor_name: formData.debtor_name,
          amount: amount,
          reason: formData.reason,
          expected_date: formData.expected_date || null
        }])

      if (error) {
        console.error('Error agregando cuenta por cobrar:', error)
        alert('Error al agregar la cuenta por cobrar. Por favor intenta de nuevo.')
        return
      }

      setFormData({ debtor_name: '', amount: '', reason: '', expected_date: '' })
      setShowForm(false)
      await loadAccountsReceivable()
      alert('Cuenta por cobrar agregada exitosamente!')
    } catch (error) {
      console.error('Error agregando cuenta por cobrar:', error)
      alert('Error al agregar la cuenta por cobrar. Por favor intenta de nuevo.')
    }
  }

  // Marcar como cobrado y crear transacción
  const markAsPaid = async (account: AccountReceivable) => {
    try {
      // Actualizar la cuenta por cobrar
      const { error: updateError } = await supabase
        .from('accounts_receivable')
        .update({
          is_paid: true,
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', account.id)

      if (updateError) {
        console.error('Error actualizando cuenta por cobrar:', updateError)
        alert('Error al marcar como cobrado. Por favor intenta de nuevo.')
        return
      }

      // Crear transacción automática
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'income',
          amount: account.amount,
          category: 'Cuentas por Cobrar',
          description: `Pago recibido de ${account.debtor_name} - ${account.reason}`,
          date: new Date().toISOString().split('T')[0]
        }])

      if (transactionError) {
        console.error('Error creando transacción:', transactionError)
        // No fallar completamente si la transacción falla
      }

      await loadAccountsReceivable()
      onBalanceUpdate() // Actualizar balance en el dashboard principal
    } catch (error) {
      console.error('Error marcando como cobrado:', error)
      alert('Error al procesar el cobro. Por favor intenta de nuevo.')
    }
  }

  // Marcar como no cobrado
  const markAsUnpaid = async (account: AccountReceivable) => {
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .update({
          is_paid: false,
          paid_date: null
        })
        .eq('id', account.id)

      if (error) throw error

      loadAccountsReceivable()
    } catch (error) {
      console.error('Error marcando como no cobrado:', error)
    }
  }

  // Eliminar cuenta por cobrar
  const deleteAccount = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta por cobrar?')) return

    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadAccountsReceivable()
    } catch (error) {
      console.error('Error eliminando cuenta por cobrar:', error)
    }
  }

  const getDaysUntilExpected = (expectedDate: string) => {
    if (!expectedDate) return null
    
    const today = new Date()
    const expected = new Date(expectedDate)
    const diffTime = expected.getTime() - today.getTime()
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
          <UserIcon className="h-6 w-6 mr-2 text-green-500" />
          Cuentas por Cobrar
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
                Nombre del deudor *
              </label>
              <input
                type="text"
                required
                value={formData.debtor_name}
                onChange={(e) => setFormData({ ...formData, debtor_name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ej. Juan Pérez, Empresa ABC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto *
              </label>
              <input
                type="text"
                required
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="₡0.00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo/Concepto *
              </label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ej. Préstamo personal, Trabajo freelance, Venta de producto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha esperada de pago
              </label>
              <input
                type="date"
                value={formData.expected_date}
                onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
        {accountsReceivable.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay cuentas por cobrar registradas. Agrega tu primera cuenta por cobrar para comenzar.
          </p>
        ) : (
          accountsReceivable.map((account) => {
            const daysUntilExpected = account.expected_date ? getDaysUntilExpected(account.expected_date) : null
            const isOverdue = daysUntilExpected !== null && daysUntilExpected < 0 && !account.is_paid
            const isDueSoon = daysUntilExpected !== null && daysUntilExpected <= 3 && daysUntilExpected >= 0 && !account.is_paid

            return (
              <div
                key={account.id}
                className={`border rounded-lg p-4 ${
                  account.is_paid
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
                      checked={account.is_paid}
                      onChange={() =>
                        account.is_paid ? markAsUnpaid(account) : markAsPaid(account)
                      }
                      className="h-5 w-5 text-green-600 rounded"
                    />
                    <div>
                      <h3 className={`font-medium ${
                        account.is_paid ? 'text-green-700 line-through' : 'text-gray-900'
                      }`}>
                        {account.debtor_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ₡{account.amount.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • {account.reason}
                      </p>
                      {account.expected_date && (
                        <p className="text-sm text-gray-400 flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Esperado: {new Date(account.expected_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      {account.is_paid ? (
                        <span className="text-sm text-green-600 font-medium">✓ Cobrado</span>
                      ) : account.expected_date ? (
                        <span className={`text-sm font-medium ${
                          isOverdue
                            ? 'text-red-600'
                            : isDueSoon
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}>
                          {isOverdue
                            ? `Vencido hace ${Math.abs(daysUntilExpected!)} días`
                            : daysUntilExpected === 0
                            ? 'Vence hoy'
                            : daysUntilExpected! > 0
                            ? `Faltan ${daysUntilExpected} días`
                            : 'Pendiente'
                          }
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">Pendiente</span>
                      )}
                      {account.paid_date && (
                        <p className="text-xs text-gray-400">
                          Cobrado: {new Date(account.paid_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => deleteAccount(account.id)}
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

      {accountsReceivable.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total por cobrar pendiente:</span>
            <span className="font-medium text-green-600">
              ₡{accountsReceivable
                .filter(account => !account.is_paid)
                .reduce((sum, account) => sum + account.amount, 0)
                .toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
