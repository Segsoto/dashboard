'use client'

import { useState, useEffect } from 'react'
import { supabase, User, SavingsGoal } from '@/lib/supabase'
import { BanknotesIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

interface SavingsSummaryProps {
  user: User
  refreshTrigger?: number
}

export default function SavingsSummary({ user, refreshTrigger }: SavingsSummaryProps) {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSavingsSummary = async () => {
      try {
        const { data, error } = await supabase
          .from('savings_goals')
          .select('*')
          .eq('user_id', user.id)

        if (error) throw error
        setSavingsGoals(data || [])
      } catch (error) {
        console.error('Error cargando resumen de ahorros:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSavingsSummary()
  }, [user.id, refreshTrigger])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border border-green-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0)
  const totalTargets = savingsGoals.reduce((sum, goal) => sum + goal.target_amount, 0)
  const completedGoals = savingsGoals.filter(goal => goal.is_completed).length
  const overallProgress = totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BanknotesIcon className="h-5 w-5 mr-2 text-green-600" />
          Resumen de Ahorros
        </h3>
        <ArrowTrendingUpIcon className="h-6 w-6 text-blue-500" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Ahorrado:</span>
          <span className="text-xl font-bold text-green-600">₡{totalSaved.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        {savingsGoals.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Meta Total:</span>
              <span className="text-lg font-semibold text-blue-600">₡{totalTargets.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Progreso General:</span>
              <span className="text-sm font-medium text-gray-700">{overallProgress.toFixed(1)}%</span>
            </div>
            
            {/* Barra de progreso general */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Metas Completadas:</span>
              <span className="text-sm font-medium text-purple-600">
                {completedGoals}/{savingsGoals.length} 
                {completedGoals > 0 && <span className="ml-1">🎯</span>}
              </span>
            </div>
            
            {/* Próximas metas por completar */}
            {savingsGoals.length > completedGoals && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Próximas metas:</p>
                {savingsGoals
                  .filter(goal => !goal.is_completed)
                  .slice(0, 2)
                  .map(goal => {
                    const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
                    return (
                      <div key={goal.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 truncate max-w-[120px]">{goal.name}</span>
                        <span className="text-gray-500">{progress.toFixed(1)}%</span>
                      </div>
                    )
                  })}
              </div>
            )}
          </>
        )}
        
        {savingsGoals.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            No hay metas de ahorro creadas
          </p>
        )}
      </div>
    </div>
  )
}
