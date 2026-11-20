export default function SideNav({ currentView, setView, settings, onSettingsChange }) {
  const timeOptions = [
    { value: 15, icon: 'timer_10' },
    { value: 30, icon: 'timer' },
    { value: 60, icon: 'hourglass_bottom' },
    { value: 120, icon: 'more_time' },
  ];

  const toggleSound = () => {
    const nextSound =
      settings.sound === 'off'
        ? 'mechanical'
        : settings.sound === 'mechanical'
        ? 'tactile'
        : 'off';
    onSettingsChange({ ...settings, sound: nextSound });
  };

  return (
    <aside className="hidden md:flex h-screen w-20 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/25 flex-col items-center py-6 z-50">
      <div className="mb-8 text-center">
        <button
          type="button"
          onClick={() => setView('practice')}
          className="w-12 h-12 flex items-center justify-center rounded-xl text-primary-fixed hover:bg-surface-variant/50 transition-colors cursor-pointer"
          title="ReyType Practice"
        >
          <span className="material-symbols-outlined text-3xl" data-icon="keyboard">
            keyboard
          </span>
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-5 w-full">
        {timeOptions.map((opt) => {
          const isActive =
            (settings.mode || 'time') === 'time' &&
            settings.time === opt.value &&
            !settings.isCustomTime;
          return (
            <div key={opt.value} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onSettingsChange({
                    ...settings,
                    mode: 'time',
                    time: opt.value,
                    isCustomTime: false,
                  });
                  setView('practice');
                }}
                className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold transition-all active:scale-90 cursor-pointer ${
                  isActive
                    ? 'text-primary-fixed bg-surface-variant border border-primary-fixed/40'
                    : 'text-on-tertiary-container hover:bg-surface-variant/60 hover:text-on-surface'
                }`}
                title={`Mode Waktu ${opt.value} Detik`}
              >
                <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
              </button>
              <span
                className={`font-metric-label text-[10px] tabular-nums ${
                  isActive ? 'text-primary-fixed' : 'text-on-tertiary-container'
                }`}
              >
                {opt.value}s
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-4 w-full items-center">
        <button
          type="button"
          onClick={() =>
            onSettingsChange({ ...settings, showKeyboard: !settings.showKeyboard })
          }
          className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer ${
            settings.showKeyboard
              ? 'text-primary-fixed bg-surface-variant border border-primary-fixed/40'
              : 'text-on-tertiary-container hover:bg-surface-variant/60 hover:text-on-surface'
          }`}
          title={settings.showKeyboard ? 'Sembunyikan Keyboard Virtual' : 'Tampilkan Keyboard Virtual'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {settings.showKeyboard ? 'keyboard_alt' : 'keyboard_hide'}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleSound}
          className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer ${
            settings.sound && settings.sound !== 'off'
              ? 'text-primary-fixed bg-surface-variant border border-primary-fixed/40'
              : 'text-on-tertiary-container hover:bg-surface-variant/60 hover:text-on-surface'
          }`}
          title={`Suara Ketikan: ${settings.sound || 'off'}`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {settings.sound && settings.sound !== 'off' ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setView('history')}
          className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer ${
            currentView === 'history'
              ? 'text-primary-fixed bg-surface-variant border border-primary-fixed/40'
              : 'text-on-tertiary-container hover:bg-surface-variant/60 hover:text-on-surface'
          }`}
          title="Riwayat Sesi"
        >
          <span className="material-symbols-outlined text-[20px]" data-icon="history">
            history
          </span>
        </button>

        <button
          type="button"
          onClick={() => setView('settings')}
          className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer ${
            currentView === 'settings'
              ? 'text-primary-fixed bg-surface-variant border border-primary-fixed/40'
              : 'text-on-tertiary-container hover:bg-surface-variant/60 hover:text-on-surface'
          }`}
          title="Pengaturan"
        >
          <span className="material-symbols-outlined text-[20px]" data-icon="settings">
            settings
          </span>
        </button>
      </div>
    </aside>
  );
}
