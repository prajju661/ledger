interface SuggestedPromptsProps {
  userName: string
  onSelect: (prompt: string) => void
}

const PROMPTS = [
  'Where is my passport?',
  'Show my overdue routines',
  'When did I last service my car?',
  'Add a new item',
  "What's due today?",
]

export function SuggestedPrompts({ userName, onSelect }: SuggestedPromptsProps) {
  const first = userName.split(' ')[0]

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      {/* AI icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.15))',
          boxShadow:  '0 0 40px rgba(99,102,241,0.2)',
          animation:  'pulse 3s ease-in-out infinite',
        }}
      >
        ✦
      </div>

      <h2 className="text-xl font-semibold text-text-primary mb-1">
        Hi {first}! What can I help you find?
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        I can search your items, check routines, or look up activity history.
      </p>

      {/* Prompt chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="px-3 py-1.5 rounded-full text-sm glass border border-white/[0.12] text-text-secondary hover:text-text-primary hover:border-accent-primary/40 hover:bg-accent-primary/5 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
