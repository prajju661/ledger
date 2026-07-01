'use client'

import { useState, useRef } from 'react'
import { Camera, Lock, Mail } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface ProfileTabProps {
  profile: Profile
  userEmail: string
}

export function ProfileTab({ profile, userEmail }: ProfileTabProps) {
  const [name, setName] = useState(profile.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const avatarBucket = process.env.NEXT_PUBLIC_AVATARS_BUCKET ?? 'avatars'

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image.')
      return
    }

    // Validate size (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB.')
      return
    }

    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleRemoveAvatar() {
    setPendingFile(null)
    setPreviewUrl(null)
    setAvatarUrl(null)
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Name cannot be empty.')
      return
    }

    setIsSaving(true)
    try {
      let newAvatarUrl = avatarUrl

      // Upload avatar if a new file is pending
      if (pendingFile) {
        const supabase = createClient()
        const ext = pendingFile.name.split('.').pop() ?? 'jpg'
        const filePath = `${profile.id}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from(avatarBucket)
          .upload(filePath, pendingFile, { upsert: true })

        if (uploadError) {
          toast.error('Failed to upload avatar. Try again.')
          setIsSaving(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from(avatarBucket)
          .getPublicUrl(filePath)

        newAvatarUrl = publicUrl
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), avatar_url: newAvatarUrl }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error ?? 'Failed to save profile.')
        return
      }

      setAvatarUrl(newAvatarUrl)
      setPendingFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      toast.success('Profile updated!')
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const displayAvatar = previewUrl ?? avatarUrl
  const memberSince = format(new Date(profile.created_at), 'MMMM yyyy')

  return (
    <div className="space-y-4">
      {/* Avatar + Name */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">
          Profile Info
        </h3>

        {/* Avatar upload */}
        <div className="flex items-start gap-5 mb-6">
          <div className="relative group">
            <Avatar
              name={name || profile.name}
              src={displayAvatar}
              size={80}
              className="ring-2 ring-white/10"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Change avatar"
            >
              <Camera size={20} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload avatar"
            />
          </div>

          <div className="pt-1">
            <p className="text-sm font-medium text-text-primary mb-1">Profile Photo</p>
            <p className="text-xs text-text-muted mb-3">JPEG, PNG, or WebP — max 2 MB</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-accent-primary hover:underline"
              >
                Change photo
              </button>
              {displayAvatar && (
                <>
                  <span className="text-text-muted text-xs">·</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs text-error hover:underline"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Name field */}
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={100}
          />

          <Button
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving}
            className="w-full"
          >
            Save Changes
          </Button>
        </div>
      </GlassCard>

      {/* Read-only info */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Account Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={15} className="text-text-muted shrink-0" />
            <span className="text-text-secondary">{userEmail}</span>
            <Lock size={13} className="text-text-muted ml-auto shrink-0" />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text-muted text-xs w-[15px] text-center">📅</span>
            <span className="text-text-secondary">Member since {memberSince}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
