'use client'

import { useState, useEffect } from 'react'
import { supabase, User, AccountReceivable } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

interface AccountsReceivableProps {
  user: User
  onPaymentReceived: (amount: number) => void
}

export default function AccountsReceivable({ user, onPaymentReceived }: AccountsReceivableProps) {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Formulario
  const [debtorName, setDebtorName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [expectedDate, setExpectedDate] = useState('')

  useEffect(() => {
    loadAccountsReceivable()
  }, [user])

  const loadAccountsReceivable = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error cargando cuentas por cobrar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .insert([
          {
            user_id: user.id,
            debtor_name: debtorName,
            amount: parseFloat(amount),
            description: description || null,
            expected_date: expectedDate || null,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setAccounts([data, ...accounts])
      setShowForm(false)
      resetForm()
      alert('Cuenta por cobrar agregada exitosamente')
    } catch (error: any) {
      console.error('Error completo:', error)
      let errorMessage = 'Error al agregar cuenta por cobrar.'
      
      if (error.message?.includes('relation "accounts_receivable" does not exist')) {
        errorMessage = 'La tabla de cuentas por cobrar no existe. Por favor, ejecuta el script de migración en Supabase.'
      } else if (error.message?.includes('violates foreign key constraint')) {
        errorMessage = 'Error de configuración de base de datos. Verifica que las tablas estén correctamente creadas.'
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentReceived = async (account: AccountReceivable, isPaid: boolean) => {
    try {
      const updateData = isPaid 
        ? { 
            is_paid: true, 
            paid_date: new Date().toISOString().split('T')[0] 
          }
        : { 
            is_paid: false, 
            paid_date: undefined 
          }

      const { error } = await supabase
        .from('accounts_receivable')
        .update(updateData)
        .eq('id', account.id)

      if (error) throw error

      // Actualizar el estado local
      setAccounts(accounts.map(acc => 
        acc.id === account.id 
          ? { ...acc, is_paid: updateData.is_paid, paid_date: updateData.paid_date }
          : acc
      ))

      if (isPaid) {
        // Crear transacción automática
        await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              type: 'income',
              amount: account.amount,
              category: 'Otros ingresos',
              description: `Pago recibido de: ${account.debtor_name}${account.description ? ` - ${account.description}` : ''}`,
              date: new Date().toISOString().split('T')[0],
            },
          ])

        onPaymentReceived(account.amount) // Sumar al balance
      } else {
        onPaymentReceived(-account.amount) // Restar del balance
      }
    } catch (error) {
      console.error('Error procesando pago recibido:', error)
      alert('Error al procesar el pago. Por favor, intenta de nuevo.')
    }
  }

  const resetForm = () => {
    setDebtorName('')
    setAmount('')
    setDescription('')
    setExpectedDate('')
  }

  const getTotalPending = () => {
    return accounts
      .filter(acc => !acc.is_paid)
      .reduce((sum, acc) => sum + acc.amount, 0)
  }

  const getTotalReceived = () => {
    return accounts
      .filter(acc => acc.is_paid)
      .reduce((sum, acc) => sum + acc.amount, 0)
  }

  const getOverdueCount = () => {
    const today = new Date()
    return accounts.filter(acc => 
      !acc.is_paid && 
      acc.expected_date && 
      new Date(acc.expected_date) < today
    ).length
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
              Cuentas por Cobrar
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Dinero que te deben y pagos pendientes
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          >
            {showForm ? 'Cancelar' : 'Agregar Cuenta'}
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-600">Total Pendiente</div>
            <div className="text-lg font-semibold text-blue-700">
              {formatCurrency(getTotalPending())}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-600">Total Cobrado</div>
            <div className="text-lg font-semibold text-green-700">
              {formatCurrency(getTotalReceived())}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-red-600">Vencidas</div>
            <div className="text-lg font-semibold text-red-700">
              {getOverdueCount()} cuentas
            </div>
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del deudor
                </label>
                <input
                  type="text"
                  required
                  value={debtorName}
                  onChange={(e) => setDebtorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Juan Pérez, Empresa ABC"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha esperada de pago (opcional)
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo/Descripción
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Préstamo, Trabajo freelance, Venta"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cuenta'}
              </button>
            </div>
          </form>
        )}

        {/* Lista de cuentas por cobrar */}
        <div className="space-y-3">
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tienes cuentas por cobrar registradas.
              <br />
              Agrega una cuando alguien te deba dinero.
            </div>
          ) : (
            accounts.map((account) => {
              const isOverdue = account.expected_date && 
                new Date(account.expected_date) < new Date() && 
                !account.is_paid
              
              return (
                <div
                  key={account.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    account.is_paid 
                      ? 'bg-green-50 border-green-200' 
                      : isOverdue 
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={account.is_paid}
                      onChange={(e) => handlePaymentReceived(account, e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className={`font-medium ${
                        account.is_paid ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {account.debtor_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {account.description && `${account.description} • `}
                        {account.expected_date && (
                          <>
                            Esperado: {formatDate(account.expected_date)}
                            {isOverdue && (
                              <span className="text-red-600 font-medium"> (Vencido)</span>
                            )}
                          </>
                        )}
                        {account.is_paid && account.paid_date && (
                          <span className="text-green-600">
                            • Pagado el {formatDate(account.paid_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-right ${
                    account.is_paid ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    <div className="font-semibold">
                      {formatCurrency(account.amount)}
                    </div>
                    {account.is_paid && (
                      <div className="text-xs text-green-600">
                        ✓ Cobrado
                      </div>
                    )}
                    {isOverdue && (
                      <div className="text-xs text-red-600">
                        ⚠ Vencido
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
