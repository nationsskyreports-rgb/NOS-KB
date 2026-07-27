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
        background: 'rgba(255,255,255,.82)',
        backdropFilter: 'saturate(180%) blur(14px)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-[11px] flex-shrink-0">
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center text-white font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, var(--blue-600), var(--blue-800))',
            boxShadow: '0 2px 8px rgba(37,99,235,.3)',
            letterSpacing: '-0.5px',
          }}
        >
          NOS
        </div>
        <div
          className="font-bold text-[15.5px]"
          style={{
            color: 'var(--ink)',
            letterSpacing: '-0.2px',
          }}
        >
          Knowledge <span style={{ color: 'var(--blue-600)' }}>Base</span>
        </div>
        <div
          className="text-[11px] font-medium border-l pl-[11px] ml-[3px]"
          style={{
            color: 'var(--faint)',
            borderColor: 'var(--border)',
          }}
        >
          v1.0
        </div>
      </div>

      {/* Search Trigger */}
      <button
        onClick={onSearchClick}
        className="flex-1 max-w-[420px] h-[38px] mx-auto rounded-[10px] flex items-center gap-[9px] px-3 text-[13.5px] border transition-all hover:border-blue-200 hover:bg-white hover:shadow-sm"
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--border)',
          color: 'var(--faint)',
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="flex-1 text-left">Search...</span>
        <div className="flex gap-[3px] ml-auto">
          <kbd
            className="text-[11px] px-[6px] py-[1px] rounded border"
            style={{
              background: 'var(--white)',
              borderColor: 'var(--border)',
              color: 'var(--muted)',
              boxShadow: '0 1px 0 var(--border)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ⌘
          </kbd>
          <kbd
            className="text-[11px] px-[6px] py-[1px] rounded border"
            style={{
              background: 'var(--white)',
              borderColor: 'var(--border)',
              color: 'var(--muted)',
              boxShadow: '0 1px 0 var(--border)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            K
          </kbd>
        </div>
      </button>

      {/* Admin Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isAdmin && (
          <button
            onClick={onNewArticle}
            className="h-[38px] px-4 rounded-[7px] text-white text-[13px] font-semibold flex items-center gap-[7px] transition-all hover:bg-blue-700"
            style={{ backgroundColor: 'var(--blue-600)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New
          </button>
        )}

        {isAdmin ? (
          <button
            onClick={onLogoutClick}
            className="h-[38px] px-[13px] rounded-[7px] text-[12.5px] font-semibold border flex items-center gap-2 transition-all"
            style={{
              color: 'var(--ink-2)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[12px] font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--c-guide), #059669)',
              }}
            >
              A
            </div>
            Logout
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="h-[38px] px-4 rounded-[7px] text-white text-[13px] font-semibold transition-all hover:bg-blue-700"
            style={{ backgroundColor: 'var(--blue-600)' }}
          >
            Edit
          </button>
        )}
      </div>
    </header>
  )
}
