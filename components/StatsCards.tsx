'use client'

import { Transaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  transactions: Transaction[]
  balanceAdjustment?: number
}

export default function StatsCards({ transactions, balanceAdjustment = 0 }: StatsCardsProps) {
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
      icon: '↗️',
    },
    {
      name: 'Total Gastos',
      value: formatCurrency(totalExpenses),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '↘️',
    },
    {
      name: 'Balance',
      value: formatCurrency(balance),
      color: balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: balance >= 0 ? 'bg-green-50' : 'bg-red-50',
      icon: balance >= 0 ? '💰' : '⚠️',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
