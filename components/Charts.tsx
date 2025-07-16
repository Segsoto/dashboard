'use client'

import { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import { Transaction } from '@/lib/supabase'
import { categories } from '@/lib/database'
import { generateChartColors } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface ChartsProps {
  transactions: Transaction[]
}

export default function Charts({ transactions }: ChartsProps) {
  const incomeVsExpenseData = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      labels: ['Ingresos', 'Gastos'],
      datasets: [
        {
          data: [totalIncome, totalExpenses],
          backgroundColor: ['#22c55e', '#ef4444'],
          borderColor: ['#16a34a', '#dc2626'],
          borderWidth: 1,
        },
      ],
    }
  }, [transactions])

  const expensesByCategoryData = useMemo(() => {
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const labels = Object.keys(expensesByCategory)
    const data = labels.map(label => expensesByCategory[label])
    const colors = generateChartColors(labels.length)

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        },
      ],
    }
  }, [transactions])

  const monthlyData = useMemo(() => {
    const monthlyStats = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 }
      }
      acc[month][t.type] += t.amount
      return acc
    }, {} as Record<string, { income: number; expense: number }>)

    const labels = Object.keys(monthlyStats).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })

    return {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: labels.map(month => monthlyStats[month].income),
          backgroundColor: '#22c55e',
          borderColor: '#16a34a',
          borderWidth: 1,
        },
        {
          label: 'Gastos',
          data: labels.map(month => monthlyStats[month].expense),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1,
        },
      ],
    }
  }, [transactions])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Ingresos vs Gastos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Ingresos vs Gastos
        </h3>
        <div className="h-64">
          <Pie data={incomeVsExpenseData} options={pieOptions} />
        </div>
      </div>

      {/* Gastos por categoría */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Gastos por Categoría
        </h3>
        <div className="h-64">
          <Pie data={expensesByCategoryData} options={pieOptions} />
        </div>
      </div>

      {/* Evolución mensual */}
      <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Evolución Mensual
        </h3>
        <div className="h-64">
          <Bar data={monthlyData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
