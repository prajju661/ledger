import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// DELETE /api/account — permanently delete account, all data and storage files
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const userId = user.id
    const itemImagesBucket = process.env.NEXT_PUBLIC_ITEM_IMAGES_BUCKET ?? 'item-images'
    const avatarsBucket    = process.env.NEXT_PUBLIC_AVATARS_BUCKET    ?? 'avatars'

    // 1. Delete item images from storage (item-images/{userId}/)
    try {
      const { data: itemFiles } = await supabaseAdmin.storage
        .from(itemImagesBucket)
        .list(userId)

      if (itemFiles && itemFiles.length > 0) {
        const paths = itemFiles.map((f) => `${userId}/${f.name}`)
        await supabaseAdmin.storage.from(itemImagesBucket).remove(paths)
      }
    } catch {
      // Non-fatal — continue with deletion
    }

    // 2. Delete avatar from storage (avatars/{userId}.*)
    try {
      // List all files at root of avatars bucket matching userId prefix
      const { data: avatarFiles } = await supabaseAdmin.storage
        .from(avatarsBucket)
        .list('', { search: userId })

      if (avatarFiles && avatarFiles.length > 0) {
        const paths = avatarFiles
          .filter((f) => f.name.startsWith(userId))
          .map((f) => f.name)
        if (paths.length > 0) {
          await supabaseAdmin.storage.from(avatarsBucket).remove(paths)
        }
      }
    } catch {
      // Non-fatal — continue with deletion
    }

    // 3. Delete all DB rows — foreign key ON DELETE CASCADE handles child tables
    // Explicitly delete from each table in case cascade isn't set up
    await Promise.allSettled([
      supabaseAdmin.from('chats').delete().eq('user_id', userId),
      supabaseAdmin.from('activity_logs').delete().eq('user_id', userId),
      supabaseAdmin.from('routine_completions').delete().eq('user_id', userId),
      supabaseAdmin.from('routines').delete().eq('user_id', userId),
      supabaseAdmin.from('items').delete().eq('user_id', userId),
      supabaseAdmin.from('profiles').delete().eq('id', userId),
    ])

    // 4. Delete the auth user (must be last)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      return NextResponse.json(
        { data: null, error: `Failed to delete account: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
