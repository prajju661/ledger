'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { getGreeting } from '@/lib/utils'
import { fadeInDown }  from '@/lib/animations'

interface DashboardGreetingProps {
  name: string
}

export function DashboardGreeting({ name }: DashboardGreetingProps) {
  return (
    <motion.div variants={fadeInDown} initial="hidden" animate="visible">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
        {getGreeting(name)}
      </h1>
      <p className="text-sm text-text-secondary mt-1">
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </p>
    </motion.div>
  )
}
