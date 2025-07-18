import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('fixed_expenses')
      .select('*')
      .eq('user_id', user_id)
      .order('due_day', { ascending: true })

    if (error) {
      console.error('Error fetching fixed expenses:', error)
      return NextResponse.json(
        { error: 'Error al cargar gastos fijos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ fixed_expenses: data })
  } catch (error) {
    console.error('Error in fixed-expenses API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, name, amount, description, due_day } = body

    if (!user_id || !name || !amount || !due_day) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert([{
        user_id,
        name,
        amount: parseFloat(amount),
        description,
        due_day: parseInt(due_day)
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating fixed expense:', error)
      return NextResponse.json(
        { error: 'Error al crear gasto fijo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ fixed_expense: data }, { status: 201 })
  } catch (error) {
    console.error('Error in fixed-expenses POST API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_paid, last_paid_date } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('fixed_expenses')
      .update({
        is_paid,
        last_paid_date
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating fixed expense:', error)
      return NextResponse.json(
        { error: 'Error al actualizar gasto fijo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ fixed_expense: data })
  } catch (error) {
    console.error('Error in fixed-expenses PUT API:', error)
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
      .from('fixed_expenses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting fixed expense:', error)
      return NextResponse.json(
        { error: 'Error al eliminar gasto fijo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Gasto fijo eliminado' })
  } catch (error) {
    console.error('Error in fixed-expenses DELETE API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
