export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* AI avatar */}
      <div
        className="w-7 h-7 rounded-full shrink-0 mt-1 flex items-center justify-center text-xs animate-pulse"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
      >
        ✦
      </div>

      <div>
        <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 inline-block">
          <div className="flex items-center gap-1.5">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full bg-text-muted inline-block animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-1 ml-1">LifeGuide is thinking…</p>
      </div>
    </div>
  )
}
