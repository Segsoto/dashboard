'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/supabase'

interface LoginFormProps {
  onLogin: (user: User) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        onLogin(existingUser)
      } else {
        // Crear nuevo usuario
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{ name, email }])
          .select()
          .single()

        if (error) throw error
        onLogin(newUser)
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      alert('Error al iniciar sesión. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Dashboard de Finanzas Personales
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tus datos para acceder
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Cargando...' : 'Acceder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
