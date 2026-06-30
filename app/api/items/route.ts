import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ITEM_IMAGES_BUCKET, MAX_ITEM_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants'
import type { Item } from '@/types'

// ─── GET /api/items ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search   = searchParams.get('search')   ?? ''
    const category = searchParams.get('category') ?? ''
    const sort     = searchParams.get('sort')     ?? 'created_at'
    const limit    = Math.min(parseInt(searchParams.get('limit')  ?? '50'), 100)
    const offset   = parseInt(searchParams.get('offset') ?? '0')

    let query = supabase
      .from('items')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,location.ilike.%${search}%,notes.ilike.%${search}%`
      )
    }
    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    const ascending = sort === 'name'
    query = query
      .order(sort === 'name' ? 'name' : 'created_at', { ascending })
      .range(offset, offset + limit - 1)

    const { data: items, error, count } = await query

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { items: items ?? [], total: count ?? 0 }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── POST /api/items ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') ?? ''
    let name = '', category = '', location = '', notes = ''
    let imageFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      name     = (form.get('name')     as string) ?? ''
      category = (form.get('category') as string) ?? ''
      location = (form.get('location') as string) ?? ''
      notes    = (form.get('notes')    as string) ?? ''
      imageFile = (form.get('image') as File) || null
    } else {
      const body = await request.json() as Record<string, string>
      name     = body.name     ?? ''
      category = body.category ?? ''
      location = body.location ?? ''
      notes    = body.notes    ?? ''
    }

    // Validate required fields
    if (!name.trim()) {
      return NextResponse.json({ data: null, error: 'Item name is required.' }, { status: 400 })
    }
    if (!location.trim()) {
      return NextResponse.json({ data: null, error: 'Location is required.' }, { status: 400 })
    }
    if (!category.trim()) {
      return NextResponse.json({ data: null, error: 'Category is required.' }, { status: 400 })
    }

    // Handle image upload
    let image_url: string | null = null
    if (imageFile && imageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          { data: null, error: 'Only JPG, PNG, and WEBP images are allowed.' },
          { status: 400 }
        )
      }
      if (imageFile.size > MAX_ITEM_IMAGE_SIZE) {
        return NextResponse.json(
          { data: null, error: 'Image must be smaller than 5MB.' },
          { status: 413 }
        )
      }

      const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`
      const arrayBuffer = await imageFile.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from(ITEM_IMAGES_BUCKET)
        .upload(filePath, arrayBuffer, { contentType: imageFile.type, upsert: false })

      if (uploadError) {
        return NextResponse.json(
          { data: null, error: `Image upload failed: ${uploadError.message}` },
          { status: 500 }
        )
      }

      const { data: urlData } = supabase.storage
        .from(ITEM_IMAGES_BUCKET)
        .getPublicUrl(filePath)
      image_url = urlData.publicUrl
    }

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        name: name.trim(),
        category,
        location: location.trim(),
        notes: notes.trim() || null,
        image_url,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { item }, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── Helper: extract storage path from public URL ────────────────────────────

export function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    // Path format: /storage/v1/object/public/{bucket}/{path}
    const parts = url.pathname.split(`/object/public/${ITEM_IMAGES_BUCKET}/`)
    return parts[1] ?? null
  } catch {
    return null
  }
}

export type { Item }
