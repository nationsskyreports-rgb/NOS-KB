'use client'

interface TopbarProps {
  isAdmin: boolean
  onLoginClick: () => void
  onLogoutClick: () => void
  onSearchClick: () => void
  onNewArticle: () => void
}

export default function Topbar({
  isAdmin,
  onLoginClick,
  onLogoutClick,
  onSearchClick,
  onNewArticle,
}: TopbarProps) {
  return (
    <header
      className="sticky top-0 z-50 h-[60px] flex items-center gap-[18px] px-[22px] border-b"
      style={{
        background: 'rgba(255,255,255,.85)',
        backdropFilter: 'saturate(180%) blur(16px)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-[11px] flex-shrink-0">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-extrabold text-[11px] tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            boxShadow: '0 3px 12px rgba(37,99,235,.35)',
          }}
        >
          NOS
        </div>
        <div>
          <div className="font-bold text-[15px] leading-tight" style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}>
            Knowledge <span style={{ color: 'var(--blue-600)' }}>Base</span>
          </div>
          <div className="text-[10px] font-medium" style={{ color: 'var(--faint)' }}>
            Nations of Sky
          </div>
        </div>
      </div>

      {/* Search */}
      <button
        onClick={onSearchClick}
        className="flex-1 max-w-[440px] h-[38px] mx-auto rounded-[10px] flex items-center gap-[9px] px-3 text-[13.5px] border transition-all hover:border-blue-300 hover:shadow-md group"
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--border)',
          color: 'var(--faint)',
        }}
      >
        <svg className="w-4 h-4 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left">ابحث في المقالات...</span>
        <div className="flex gap-[3px]">
          <kbd className="text-[10px] px-[5px] py-[1px] rounded border font-mono"
            style={{ background: 'var(--white)', borderColor: 'var(--border)', color: 'var(--muted)', boxShadow: '0 1px 0 var(--border)' }}>
            ⌘K
          </kbd>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isAdmin && (
          <button
            onClick={onNewArticle}
            className="h-[38px] px-4 rounded-[10px] text-white text-[13px] font-semibold flex items-center gap-[7px] transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 2px 8px rgba(37,99,235,.3)' }}
          >
            <span className="text-lg leading-none">+</span> مقال جديد
          </button>
        )}

        {isAdmin ? (
          <button
            onClick={onLogoutClick}
            className="h-[38px] px-3 rounded-[10px] text-[12.5px] font-semibold border flex items-center gap-2 transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            style={{ color: 'var(--ink-2)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[11px] font-bold"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              A
            </div>
            خروج
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="h-[38px] px-5 rounded-[10px] text-white text-[13px] font-semibold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 2px 8px rgba(37,99,235,.3)' }}
          >
            ✏️ تعديل
          </button>
        )}
      </div>
    </header>
  )
}
