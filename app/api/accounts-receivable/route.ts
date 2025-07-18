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
      .from('accounts_receivable')
      .select('*')
      .eq('user_id', user_id)
      .order('expected_date', { ascending: true })

    if (error) {
      console.error('Error fetching accounts receivable:', error)
      return NextResponse.json(
        { error: 'Error al cargar cuentas por cobrar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ accounts_receivable: data })
  } catch (error) {
    console.error('Error in accounts-receivable API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, debtor_name, amount, reason, expected_date } = body

    if (!user_id || !debtor_name || !amount || !reason) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('accounts_receivable')
      .insert([{
        user_id,
        debtor_name,
        amount: parseFloat(amount),
        reason,
        expected_date: expected_date || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating account receivable:', error)
      return NextResponse.json(
        { error: 'Error al crear cuenta por cobrar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ account_receivable: data }, { status: 201 })
  } catch (error) {
    console.error('Error in accounts-receivable POST API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_paid, paid_date } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('accounts_receivable')
      .update({
        is_paid,
        paid_date
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating account receivable:', error)
      return NextResponse.json(
        { error: 'Error al actualizar cuenta por cobrar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ account_receivable: data })
  } catch (error) {
    console.error('Error in accounts-receivable PUT API:', error)
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
      .from('accounts_receivable')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting account receivable:', error)
      return NextResponse.json(
        { error: 'Error al eliminar cuenta por cobrar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Cuenta por cobrar eliminada' })
  } catch (error) {
    console.error('Error in accounts-receivable DELETE API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
