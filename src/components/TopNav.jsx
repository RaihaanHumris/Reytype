export default function TopNav({ currentView, setView, profile, onOpenProfile }) {
  const navItems = [
    { id: 'practice', label: 'Practice' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="w-full bg-surface border-b border-outline-variant/20 sticky top-0 z-40">
      <div className="flex justify-between items-center gap-8 px-gutter max-w-container-max mx-auto w-full h-16">
        {/* Zone 1: Brand Title */}
        <button
          type="button"
          onClick={() => setView('practice')}
          className="font-headline-md text-headline-md font-bold text-primary-fixed whitespace-nowrap shrink-0 cursor-pointer text-left focus:outline-none"
        >
          ReyType
        </button>

        {/* Zone 2: Primary Navigation Links */}
        <nav className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`font-body-sm sm:font-body-lg text-sm sm:text-base cursor-pointer transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive
                    ? 'text-primary-fixed border-primary-fixed font-semibold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action (Player Profile) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant border border-outline-variant/30 text-on-surface transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Profil Pengetik & Target"
          >
            <span className="material-symbols-outlined text-[18px] text-primary-fixed">
              person
            </span>
            <span className="font-metric-label text-xs truncate max-w-[110px]">
              {profile?.name || 'Guest'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
