import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create client inside handler so env vars are always available at call time
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error(`Missing env vars: URL=${!!url} KEY=${!!key}`)
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const phone = searchParams.get('phone')
  const table = searchParams.get('table') || 'profiles'

  try {
    const adminSupabase = getAdminClient()

    // Phone lookup — DB stores as "919686293233" (no + prefix)
    if (phone) {
      const digits = phone.replace(/\D/g, '').slice(-10)
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('id, app_password, onboarding_complete')
        .or(`phone.eq.+91${digits},phone.eq.91${digits},phone.eq.${digits}`)
        .maybeSingle()
      if (error) {
        console.error('[user-data] phone lookup error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ data: data || null })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId or phone' }, { status: 400 })
    }

    let query = adminSupabase
      .from(table)
      .select('*')
      .eq(table === 'profiles' ? 'id' : 'user_id', userId)

    // Hide soft-deleted fields from normal UI fetches.
    if (table === 'field_batches') {
      query = query.not('status', 'eq', 'deleted')
    }

    const { data, error } = await query.order(table === 'field_batches' ? 'created_at' : 'id', { ascending: table !== 'field_batches' })

    if (error) {
      console.error(`[user-data] ${table} lookup error:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (table === 'profiles') {
      return NextResponse.json({ data: data?.[0] || null })
    }
    return NextResponse.json({ data: data || [] })

  } catch (err: any) {
    console.error('[user-data] fatal:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = getAdminClient()
    const body = await request.json()
    const { table, record } = body
    if (!table || !record) return NextResponse.json({ error: 'Missing table or record' }, { status: 400 })
    const { data, error } = await adminSupabase.from(table).insert([record]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminSupabase = getAdminClient()
    const body = await request.json()
    const { table, id, record } = body
    if (!table || !id || !record) return NextResponse.json({ error: 'Missing table, id or record' }, { status: 400 })
    const { data, error } = await adminSupabase.from(table).update(record).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminSupabase = getAdminClient()
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const id = searchParams.get('id')
    if (!table || !id) return NextResponse.json({ error: 'Missing table or id' }, { status: 400 })

    // Delete FK-dependent child rows first (CASCADE was added via migration but
    // we also do it explicitly here as a safety net)
    if (table === 'field_batches') {
      // Only tables that actually exist in the schema
      const childTables = ['field_batch_history', 'crop_rotation_plans']
      for (const child of childTables) {
        const { error: childErr } = await adminSupabase.from(child).delete().eq('field_batch_id', id)
        // Ignore "table not found" errors — only fail on real errors
        if (childErr) {
          const msg = childErr.message.toLowerCase()
          if (msg.includes('does not exist') || msg.includes('relation') || msg.includes('schema cache')) {
            console.log(`[user-data] skipping ${child} — not in schema`)
            continue
          }
          console.error(`[user-data] DELETE child ${child} error:`, childErr.message)
          return NextResponse.json({ error: childErr.message }, { status: 500 })
        }
      }
    }

    const { error } = await adminSupabase.from(table).delete().eq('id', id)
    if (error) {
      // Some schemas attach delete-history triggers that create FK conflicts.
      // Fallback to soft delete so user can still remove a field from UI.
      const msg = (error.message || '').toLowerCase()
      const canSoftDelete = table === 'field_batches' && (
        msg.includes('foreign key') ||
        msg.includes('violates') ||
        msg.includes('field_batch_history')
      )

      if (canSoftDelete) {
        const { error: softErr } = await adminSupabase
          .from('field_batches')
          .update({ status: 'deleted' })
          .eq('id', id)

        if (!softErr) {
          return NextResponse.json({ success: true, mode: 'soft-delete' })
        }

        console.error('[user-data] soft-delete fallback failed:', softErr.message)
        return NextResponse.json({ error: softErr.message }, { status: 500 })
      }

      console.error(`[user-data] DELETE ${table} error:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
