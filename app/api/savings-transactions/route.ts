import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const savings_goal_id = searchParams.get('savings_goal_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('savings_transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false })

    if (savings_goal_id) {
      query = query.eq('savings_goal_id', savings_goal_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching savings transactions:', error)
      return NextResponse.json(
        { error: 'Error al cargar transacciones de ahorro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ savings_transactions: data })
  } catch (error) {
    console.error('Error in savings-transactions API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, savings_goal_id, type, amount, description, date } = body

    if (!user_id || !savings_goal_id || !type || !amount) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (!['deposit', 'withdrawal'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de transacción inválido' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('savings_transactions')
      .insert([{
        user_id,
        savings_goal_id,
        type,
        amount: parseFloat(amount),
        description,
        date: date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating savings transaction:', error)
      return NextResponse.json(
        { error: 'Error al crear transacción de ahorro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ savings_transaction: data }, { status: 201 })
  } catch (error) {
    console.error('Error in savings-transactions POST API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('savings_transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting savings transaction:', error)
      return NextResponse.json(
        { error: 'Error al eliminar transacción de ahorro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Transacción de ahorro eliminada' })
  } catch (error) {
    console.error('Error in savings-transactions DELETE API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
