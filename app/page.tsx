'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Bot,
  PackageSearch,
  RefreshCw,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/animations'

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: PackageSearch,
    name: 'WhereDidItGo',
    description: 'Never lose track of your belongings. Tag, photo, and find anything in seconds.',
    accent: 'cyan' as const,
    color: '#06b6d4',
    glow: 'glow-cyan',
  },
  {
    icon: RefreshCw,
    name: 'Repeat',
    description: 'Build habits that stick. Track streaks, set reminders, and visualise progress.',
    accent: 'emerald' as const,
    color: '#10b981',
    glow: 'glow-emerald',
  },
  {
    icon: BookOpen,
    name: 'LifeLog',
    description: 'A running record of everything you do. Search your past, chart your growth.',
    accent: 'amber' as const,
    color: '#f59e0b',
    glow: 'glow-amber',
  },
  {
    icon: Bot,
    name: 'LifeGuide AI',
    description: 'Ask questions about your own life. Your AI knows your data, not the internet.',
    accent: 'indigo' as const,
    color: '#6366f1',
    glow: 'glow-indigo',
  },
]

const steps = [
  {
    number: '01',
    title: 'Log what matters',
    description: 'Add items, routines, and activities. Takes less than 30 seconds each.',
  },
  {
    number: '02',
    title: 'Let AI learn your patterns',
    description: 'LifeGuide AI reads your data and finds insights you\'d never spot yourself.',
  },
  {
    number: '03',
    title: 'Take back control',
    description: 'Ask anything. "Where did I put my passport?" "Am I getting enough sleep?"',
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6 md:px-10 bg-bg-surface/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center gap-2.5 flex-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
          }}
        >
          <Bot size={16} className="text-white" />
        </div>
        <span className="font-extrabold text-base gradient-text">LifeLedger AI</span>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button variant="ghost" size="sm">Sign In</Button>
        </Link>
        <Link href="/register">
          <Button variant="primary" size="sm">Get Started</Button>
        </Link>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden">
      {/* Ambient gradient mesh */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,182,212,0.1) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 w-full max-w-4xl mx-auto text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp} className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-accent-glow border-accent-primary/20">
            <Sparkles size={12} className="text-accent-primary" />
            Powered by Gemini · Built for real life
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-extrabold text-text-primary leading-tight mb-6"
        >
          Your Personal{' '}
          <span className="gradient-text">Life OS</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeInUp}
          className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Talk to your life. Or tap to manage it.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register">
            <Button
              variant="primary"
              size="lg"
              className="animate-glow px-8 gap-2"
            >
              Get Started Free
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="ghost" size="lg" className="px-8">
              See How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Floating mockup card */}
        <motion.div
          variants={scaleIn}
          className="animate-float max-w-sm mx-auto"
          aria-hidden="true"
        >
          <GlassCard accent="indigo" className="p-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))' }}
              >
                <Bot size={18} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted">LifeGuide AI</p>
                <p className="text-sm font-medium text-text-primary">Just now</p>
              </div>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-text-secondary italic">
                &ldquo;Where did I put my passport?&rdquo;
              </p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <p className="text-xs text-text-primary">
                📂 Your passport was logged under <span className="text-accent-glow font-medium">Documents → Bedroom drawer</span> on March 12th.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="px-6 py-24 max-w-6xl mx-auto" id="features">
      <motion.div
        className="text-center mb-14"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3">
          Everything in one place
        </h2>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          Four modules. One connected view of your life.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {features.map((feat) => {
          const Icon = feat.icon
          return (
            <motion.div key={feat.name} variants={fadeInUp}>
              <GlassCard
                accent={feat.accent}
                hover
                className={`p-6 h-full flex flex-col gap-4 ${feat.glow}`}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${feat.color}22, ${feat.color}11)`,
                    border: `1px solid ${feat.color}33`,
                  }}
                >
                  <Icon size={22} style={{ color: feat.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1.5">{feat.name}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{feat.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="px-6 py-24 max-w-4xl mx-auto" id="how-it-works">
      <motion.div
        className="text-center mb-14"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3">
          How it works
        </h2>
        <p className="text-text-secondary text-lg">
          Simple to start. Powerful over time.
        </p>
      </motion.div>

      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {steps.map((step, i) => (
          <motion.div key={step.number} variants={fadeInUp}>
            <GlassCard hover className="p-7 flex items-start gap-6">
              {/* Number + connector */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                    border: '1px solid rgba(99,102,241,0.25)',
                    color: '#a78bfa',
                  }}
                >
                  {step.number}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-8 mt-2 bg-gradient-to-b from-accent-primary/30 to-transparent" />
                )}
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-semibold text-text-primary mb-1.5">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="px-6 py-20">
      <motion.div
        className="max-w-3xl mx-auto"
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <div
          className="relative rounded-3xl p-12 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08), rgba(6,182,212,0.06))',
            border: '1px solid rgba(99,102,241,0.25)',
            boxShadow: '0 0 80px rgba(99,102,241,0.1)',
          }}
        >
          {/* Ambient orb */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center animate-glow"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                }}
              >
                <Bot size={26} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3">
              Ready to know your life?
            </h2>
            <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
              Free to start. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
              <Link href="/register">
                <Button variant="primary" size="lg" className="px-10 gap-2 animate-glow">
                  Start for Free
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg" className="px-8">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {['No credit card', 'Your data stays private', 'Cancel anytime'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <CheckCircle size={12} className="text-success shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="px-6 py-10 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Bot size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold gradient-text">LifeLedger AI</span>
        </div>
        <p className="text-xs text-text-muted text-center">
          Your data. Your insights. Your life.
        </p>
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
            Register
          </Link>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </>
  )
}
