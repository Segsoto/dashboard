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
      .from('savings_goals')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching savings goals:', error)
      return NextResponse.json(
        { error: 'Error al cargar metas de ahorro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ savings_goals: data })
  } catch (error) {
    console.error('Error in savings-goals API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, name, target_amount, target_date, description } = body

    if (!user_id || !name || !target_amount) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{
        user_id,
        name,
        target_amount: parseFloat(target_amount),
        target_date: target_date || null,
        description
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating savings goal:', error)
      return NextResponse.json(
        { error: 'Error al crear meta de ahorro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ savings_goal: data }, { status: 201 })
  } catch (error) {
    console.error('Error in savings-goals POST API:', error)
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
      .from('savings_goals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting savings goal:', error)
      return NextResponse.json(
        { error: 'Error al eliminar meta de ahorro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Meta de ahorro eliminada' })
  } catch (error) {
    console.error('Error in savings-goals DELETE API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
