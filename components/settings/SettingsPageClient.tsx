'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SettingsTabs, type SettingsTab } from './SettingsTabs'
import { ProfileTab } from './ProfileTab'
import { SecurityTab } from './SecurityTab'
import { UsageTab } from './UsageTab'
import { DangerZoneTab } from './DangerZoneTab'
import { fadeIn } from '@/lib/animations'
import type { Profile } from '@/types'
import type { ProfileStats } from '@/app/api/profile/stats/route'

interface SettingsPageClientProps {
  profile:   Profile
  userEmail: string
  stats:     ProfileStats
}

export function SettingsPageClient({ profile, userEmail, stats }: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>

      {/* SettingsTabs renders mobile (horizontal) and desktop (vertical) variants internally */}
      <div className="md:flex md:gap-6">
        {/* SettingsTabs handles its own responsive rendering */}
        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {activeTab === 'profile'  && (
                <ProfileTab profile={profile} userEmail={userEmail} />
              )}
              {activeTab === 'security' && <SecurityTab />}
              {activeTab === 'usage'    && <UsageTab stats={stats} />}
              {activeTab === 'danger'   && <DangerZoneTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
