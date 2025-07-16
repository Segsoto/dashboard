import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: es })
}

export const formatDateForInput = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd')
}

export const getMonthRange = (date: Date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

export const getPreviousMonth = (date: Date = new Date()) => {
  return subMonths(date, 1)
}

export const generateChartColors = (count: number): string[] => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ]
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length])
}
