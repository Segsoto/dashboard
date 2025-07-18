'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestConnection() {
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testDatabaseConnection = async () => {
    setLoading(true)
    setTestResult('Probando conexión...')
    
    try {
      // Probar conexión básica
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (usersError) {
        setTestResult(`Error conectando a users: ${usersError.message}`)
        setLoading(false)
        return
      }

      // Probar si las nuevas tablas existen
      const { data: fixedExpenses, error: fixedError } = await supabase
        .from('fixed_expenses')
        .select('*')
        .limit(1)

      if (fixedError) {
        setTestResult(`Error: La tabla fixed_expenses no existe o no es accesible: ${fixedError.message}`)
        setLoading(false)
        return
      }

      const { data: accountsReceivable, error: accountsError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .limit(1)

      if (accountsError) {
        setTestResult(`Error: La tabla accounts_receivable no existe o no es accesible: ${accountsError.message}`)
        setLoading(false)
        return
      }

      setTestResult('✅ Conexión exitosa! Todas las tablas están disponibles.')
    } catch (error) {
      setTestResult(`Error general: ${error}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-medium text-yellow-800 mb-2">🔧 Test de Conexión a Base de Datos</h3>
      <button
        onClick={testDatabaseConnection}
        disabled={loading}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? 'Probando...' : 'Probar Conexión'}
      </button>
      {testResult && (
        <div className="mt-3 p-3 bg-white rounded border">
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}
    </div>
  )
}
