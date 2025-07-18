import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description?: string
  date: string
  created_at: string
}

export interface FixedExpense {
  id: string
  user_id: string
  name: string
  amount: number
  category: string
  description?: string
  due_day: number
  is_active: boolean
  created_at: string
}

export interface FixedExpensePayment {
  id: string
  fixed_expense_id: string
  user_id: string
  month: number
  year: number
  paid_amount: number
  paid_date: string
  created_at: string
}

export interface AccountReceivable {
  id: string
  user_id: string
  debtor_name: string
  amount: number
  description?: string
  expected_date?: string
  is_paid: boolean
  paid_date?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
}
