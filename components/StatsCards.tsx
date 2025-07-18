'use client'

import { useState, useEffect } from 'react'
import { Transaction, supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  transactions: Transaction[]
  balanceAdjustment?: number
  savingsUpdateTrigger?: number // Para forzar actualización de ahorros
}

export default function StatsCards({ transactions, balanceAdjustment = 0, savingsUpdateTrigger }: StatsCardsProps) {
  const [totalSavings, setTotalSavings] = useState(0)

  // Cargar total de ahorros
  useEffect(() => {
    const loadTotalSavings = async () => {
      try {
        const { data, error } = await supabase
          .from('savings_goals')
          .select('current_amount')
          .eq('user_id', '123e4567-e89b-12d3-a456-426614174000') // Usuario por defecto

        if (error) {
          console.error('Error cargando ahorros:', error)
          return
        }

        const total = data?.reduce((sum, goal) => sum + (goal.current_amount || 0), 0) || 0
        setTotalSavings(total)
      } catch (error) {
        console.error('Error cargando ahorros:', error)
      }
    }

    loadTotalSavings()
  }, [savingsUpdateTrigger]) // Re-cargar cuando cambie el trigger

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses + balanceAdjustment

  const stats = [
    {
      name: 'Total Ingresos',
      value: formatCurrency(totalIncome),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '💰',
    },
    {
      name: 'Total Gastos',
      value: formatCurrency(totalExpenses),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '💸',
    },
    {
      name: 'Total Ahorrado',
      value: formatCurrency(totalSavings),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '🏦',
    },
    {
      name: 'Balance Disponible',
      value: formatCurrency(balance),
      color: balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: balance >= 0 ? 'bg-green-50' : 'bg-red-50',
      icon: balance >= 0 ? '✅' : '⚠️',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className={`${stat.bgColor} overflow-hidden shadow rounded-lg`}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">{stat.icon}</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className={`text-lg font-medium ${stat.color}`}>
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
