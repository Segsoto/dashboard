'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, User, Transaction } from '@/lib/supabase'
import LoginForm from '@/components/LoginForm'
import TransactionForm from '@/components/TransactionForm'
import TransactionList from '@/components/TransactionList'
import StatsCards from '@/components/StatsCards'
import Charts from '@/components/Charts'
import FixedExpenses from '@/components/FixedExpenses'
import AccountsReceivable from '@/components/AccountsReceivable'
import SavingsModule from '@/components/SavingsModule'
import SavingsSummary from '@/components/SavingsSummary'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Calcular balance actual
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const currentBalance = totalIncome - totalExpenses

  // Cargar transacciones del usuario
  const loadTransactions = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
      setFilteredTransactions(data || [])
    } catch (error) {
      console.error('Error cargando transacciones:', error)
    }
  }, [user])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Verificar si hay un usuario en localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('finance-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  // Guardar usuario en localStorage
  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser)
    localStorage.setItem('finance-user', JSON.stringify(loggedUser))
  }

  // Cerrar sesión
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('finance-user')
    setTransactions([])
    setFilteredTransactions([])
  }

  // Función para disparar el refresh del resumen de ahorros
  const handleBalanceUpdate = async () => {
    await loadTransactions()
    setRefreshTrigger(prev => prev + 1)
  }

  // Agregar nueva transacción
  const handleTransactionAdded = (newTransaction: Transaction) => {
    const updatedTransactions = [newTransaction, ...transactions]
    setTransactions(updatedTransactions)
    setFilteredTransactions(updatedTransactions)
    setRefreshTrigger(prev => prev + 1)
  }

  // Filtrar transacciones
  const handleFilterChange = useCallback((filters: { category?: string; startDate?: string; endDate?: string }) => {
    let filtered = [...transactions]

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category)
    }

    if (filters.startDate) {
      filtered = filtered.filter(t => t.date >= filters.startDate!)
    }

    if (filters.endDate) {
      filtered = filtered.filter(t => t.date <= filters.endDate!)
    }

    setFilteredTransactions(filtered)
  }, [transactions])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Finanzas
              </h1>
              <p className="text-gray-600">Bienvenido, {user.name}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowTransactionForm(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Nueva Transacción
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards transactions={filteredTransactions} />

        {/* Charts */}
        {transactions.length > 0 && (
          <Charts transactions={filteredTransactions} />
        )}

        {/* Savings Summary */}
        <div className="mt-8">
          <SavingsSummary user={user} refreshTrigger={refreshTrigger} />
        </div>

        {/* Fixed Expenses and Accounts Receivable */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          <FixedExpenses 
            user={user} 
            onBalanceUpdate={handleBalanceUpdate} 
            currentBalance={currentBalance}
          />
          <AccountsReceivable user={user} onBalanceUpdate={loadTransactions} />
        </div>

        {/* Savings Module */}
        <div className="mt-8">
          <SavingsModule 
            user={user} 
            onBalanceUpdate={handleBalanceUpdate} 
            currentBalance={currentBalance}
          />
        </div>

        {/* Transaction List */}
        <div className="mt-8">
          <TransactionList
            transactions={filteredTransactions}
            onFilterChange={handleFilterChange}
          />
        </div>
      </main>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          user={user}
          onTransactionAdded={handleTransactionAdded}
          onClose={() => setShowTransactionForm(false)}
          currentBalance={currentBalance}
        />
      )}
    </div>
  )
}
