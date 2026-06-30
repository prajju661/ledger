import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ITEM_IMAGES_BUCKET, MAX_ITEM_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants'

function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const parts = url.pathname.split(`/object/public/${ITEM_IMAGES_BUCKET}/`)
    return parts[1] ?? null
  } catch {
    return null
  }
}

// ─── PUT /api/items/:id ───────────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('items')
      .select('id, user_id, image_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ data: null, error: 'Item not found.' }, { status: 404 })
    }

    const contentType = request.headers.get('content-type') ?? ''
    const updates: Record<string, string | null> = {}
    let newImageFile: File | null = null
    let removeImage = false

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      if (form.has('name'))     updates.name     = (form.get('name')     as string).trim()
      if (form.has('category')) updates.category = form.get('category')  as string
      if (form.has('location')) updates.location = (form.get('location') as string).trim()
      if (form.has('notes'))    updates.notes    = (form.get('notes')    as string).trim() || null
      if (form.has('removeImage') && form.get('removeImage') === 'true') removeImage = true
      newImageFile = (form.get('image') as File) || null
    } else {
      const body = await request.json() as Record<string, string>
      if (body.name !== undefined)     updates.name     = body.name.trim()
      if (body.category !== undefined) updates.category = body.category
      if (body.location !== undefined) updates.location = body.location.trim()
      if (body.notes !== undefined)    updates.notes    = body.notes.trim() || null
      if (body.removeImage === 'true') removeImage = true
    }

    // Validate required fields if provided
    if (updates.name !== undefined && !updates.name) {
      return NextResponse.json({ data: null, error: 'Item name is required.' }, { status: 400 })
    }
    if (updates.location !== undefined && !updates.location) {
      return NextResponse.json({ data: null, error: 'Location is required.' }, { status: 400 })
    }

    // Handle image operations
    let image_url: string | null | undefined = undefined // undefined = no change

    if (removeImage && existing.image_url) {
      const path = extractStoragePath(existing.image_url)
      if (path) {
        await supabase.storage.from(ITEM_IMAGES_BUCKET).remove([path])
      }
      image_url = null
    }

    if (newImageFile && newImageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(newImageFile.type)) {
        return NextResponse.json(
          { data: null, error: 'Only JPG, PNG, and WEBP images are allowed.' },
          { status: 400 }
        )
      }
      if (newImageFile.size > MAX_ITEM_IMAGE_SIZE) {
        return NextResponse.json(
          { data: null, error: 'Image must be smaller than 5MB.' },
          { status: 413 }
        )
      }

      // Delete old image if present
      if (existing.image_url) {
        const oldPath = extractStoragePath(existing.image_url)
        if (oldPath) {
          await supabase.storage.from(ITEM_IMAGES_BUCKET).remove([oldPath])
        }
      }

      const ext = newImageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`
      const arrayBuffer = await newImageFile.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from(ITEM_IMAGES_BUCKET)
        .upload(filePath, arrayBuffer, { contentType: newImageFile.type, upsert: false })

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

    const payload: Record<string, unknown> = { ...updates }
    if (image_url !== undefined) payload.image_url = image_url

    const { data: item, error } = await supabase
      .from('items')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { item }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── DELETE /api/items/:id ────────────────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    // Fetch item to get image_url and verify ownership
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('id, user_id, image_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ data: null, error: 'Item not found.' }, { status: 404 })
    }

    // Delete DB record first
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    // Delete image from storage if present
    if (item.image_url) {
      const path = extractStoragePath(item.image_url)
      if (path) {
        await supabase.storage.from(ITEM_IMAGES_BUCKET).remove([path])
      }
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
