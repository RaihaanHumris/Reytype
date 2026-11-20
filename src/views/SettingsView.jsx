import { playKeySound } from '../utils/typing';
import { THEMES } from '../utils/themes';

export default function SettingsView({ settings, onSettingsChange, onResetSettings }) {
  const handleSoundSelect = (soundMode) => {
    onSettingsChange({ ...settings, sound: soundMode });
    if (soundMode !== 'off') {
      playKeySound('key', soundMode);
    }
  };

  const activeTheme = settings.theme || 'cyber-lime';

  return (
    <div className="max-w-container-max w-full bg-surface-container rounded-xl p-6 sm:p-8 border border-outline-variant/25">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-outline-variant/20">
        <div>
          <h2 className="font-headline-md text-primary text-2xl sm:text-3xl">
            Pengaturan Latihan & Tema
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-1">
            Sesuaikan tema warna layar, bahasa, tingkat kosakata, panduan 10 jari, dan suara ketikan
          </p>
        </div>
        {onResetSettings && (
          <button
            type="button"
            onClick={onResetSettings}
            className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-primary border border-outline-variant/30 font-metric-label text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            Reset Default
          </button>
        )}
      </div>

      {/* Theme Presets Section */}
      <div className="mb-8 pb-8 border-b border-outline-variant/20">
        <div className="mb-3">
          <label className="font-metric-label text-xs text-on-tertiary-container uppercase tracking-wider">
            Pilihan Tema Warna
          </label>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Pilih suasana warna yang nyaman untuk mata atau proyektor ruang kelas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {THEMES.map((theme) => {
            const isSelected = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onSettingsChange({ ...settings, theme: theme.id })}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-surface-container-high border-primary-fixed ring-2 ring-primary-fixed/30'
                    : 'bg-surface-container-low border-outline-variant/30 hover:border-primary/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-headline-md text-sm text-primary font-bold">
                      {theme.name}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary-fixed text-[18px]">
                        check_circle
                      </span>
                    )}
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-snug">
                    {theme.description}
                  </p>
                </div>

                {/* Theme Palette Preview Swatch */}
                <div
                  className="w-full h-9 rounded-lg border border-black/15 px-3 flex items-center justify-between"
                  style={{ backgroundColor: theme.preview.bg }}
                >
                  <span
                    className="font-display-typing text-xs font-bold"
                    style={{ color: theme.preview.text }}
                  >
                    abc
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.preview.surface }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.preview.accent }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Language */}
        <div className="flex flex-col gap-2.5">
          <label className="font-metric-label text-xs text-on-tertiary-container uppercase tracking-wider">
            Bahasa Utama
          </label>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Pilih bahasa kamus kata dan kutipan latihan
          </p>
          <div className="flex gap-3 mt-1">
            {[
              { id: 'id', label: 'Bahasa Indonesia' },
              { id: 'en', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSettingsChange({ ...settings, language: lang.id })}
                className={`flex-1 px-4 py-3 rounded-lg font-body-sm text-sm font-semibold transition-all border cursor-pointer ${
                  settings.language === lang.id
                    ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty / Vocabulary */}
        <div className="flex flex-col gap-2.5">
          <label className="font-metric-label text-xs text-on-tertiary-container uppercase tracking-wider">
            Tingkat Kosakata
          </label>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Cocok untuk latihan anak-anak, umum, maupun siswa IT/Coding
          </p>
          <div className="grid grid-cols-3 gap-2.5 mt-1">
            {[
              { id: 'standard', label: 'Standar' },
              { id: 'kids', label: 'Pemula / Anak' },
              { id: 'code', label: 'Coding / IT' },
            ].map((diff) => (
              <button
                key={diff.id}
                type="button"
                onClick={() => onSettingsChange({ ...settings, difficulty: diff.id })}
                className={`px-3 py-3 rounded-lg font-body-sm text-xs sm:text-sm font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                  (settings.difficulty || 'standard') === diff.id
                    ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Profile */}
        <div className="flex flex-col gap-2.5">
          <label className="font-metric-label text-xs text-on-tertiary-container uppercase tracking-wider">
            Efek Suara Tombol (Audio Sintetis)
          </label>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Umpan balik suara mekanikal saat menekan tombol keyboard
          </p>
          <div className="grid grid-cols-3 gap-2.5 mt-1">
            {[
              { id: 'off', label: 'Mati' },
              { id: 'mechanical', label: 'Mechanical' },
              { id: 'tactile', label: 'Soft Tactile' },
            ].map((snd) => (
              <button
                key={snd.id}
                type="button"
                onClick={() => handleSoundSelect(snd.id)}
                className={`px-3 py-3 rounded-lg font-body-sm text-xs sm:text-sm font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                  (settings.sound || 'off') === snd.id
                    ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Caret Style */}
        <div className="flex flex-col gap-2.5">
          <label className="font-metric-label text-xs text-on-tertiary-container uppercase tracking-wider">
            Gaya Kursor Ketik (Caret)
          </label>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Bentuk penunjuk posisi karakter aktif pada layar
          </p>
          <div className="grid grid-cols-3 gap-2.5 mt-1">
            {[
              { id: 'line', label: 'Garis ( | )' },
              { id: 'block', label: 'Blok ( █ )' },
              { id: 'underline', label: 'Bawah ( _ )' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSettingsChange({ ...settings, caretStyle: c.id })}
                className={`px-3 py-3 rounded-lg font-body-sm text-xs sm:text-sm font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                  (settings.caretStyle || 'line') === c.id
                    ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="flex flex-col gap-2.5">
          <label className="font-metric-label text-xs text-on-tertiary-container uppercase tracking-wider">
            Ukuran Teks Latihan
          </label>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Sesuaikan ukuran font di panggung mengetik
          </p>
          <div className="grid grid-cols-3 gap-2.5 mt-1">
            {[
              { size: 24, label: 'Kecil (24px)' },
              { size: 32, label: 'Sedang (32px)' },
              { size: 40, label: 'Besar (40px)' },
            ].map((item) => (
              <button
                key={item.size}
                type="button"
                onClick={() => onSettingsChange({ ...settings, fontSize: item.size })}
                className={`px-3 py-3 rounded-lg font-body-sm text-xs sm:text-sm font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                  settings.fontSize === item.size
                    ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Helpers & Modifiers */}
        <div className="flex flex-col gap-2.5">
          <label className="font-metric-label text-xs text-on-tertiary-container uppercase tracking-wider">
            Fitur Bantu & Karakter Tambahan
          </label>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Panduan visual 10 jari dan latihan karakter khusus
          </p>
          <div className="flex flex-col gap-2.5 mt-1">
            <button
              type="button"
              onClick={() =>
                onSettingsChange({ ...settings, showKeyboard: !settings.showKeyboard })
              }
              className={`w-full px-4 py-2.5 rounded-lg font-body-sm text-xs sm:text-sm flex items-center justify-between border transition-all cursor-pointer ${
                settings.showKeyboard
                  ? 'bg-primary-fixed/15 text-primary-fixed border-primary-fixed/50 font-semibold'
                  : 'bg-surface-container-low text-on-surface border-outline-variant/30'
              }`}
            >
              <span>Tampilkan Keyboard Virtual & Panduan 10 Jari</span>
              <span className="font-metric-label text-xs">
                {settings.showKeyboard ? 'AKTIF' : 'MATI'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    includePunctuation: !settings.includePunctuation,
                  })
                }
                className={`px-3 py-2.5 rounded-lg font-body-sm text-xs sm:text-sm flex items-center justify-between border transition-all cursor-pointer ${
                  settings.includePunctuation
                    ? 'bg-primary-fixed/15 text-primary-fixed border-primary-fixed/50 font-semibold'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30'
                }`}
              >
                <span>Tanda Baca</span>
                <span className="font-metric-label text-xs">
                  {settings.includePunctuation ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    includeNumbers: !settings.includeNumbers,
                  })
                }
                className={`px-3 py-2.5 rounded-lg font-body-sm text-xs sm:text-sm flex items-center justify-between border transition-all cursor-pointer ${
                  settings.includeNumbers
                    ? 'bg-primary-fixed/15 text-primary-fixed border-primary-fixed/50 font-semibold'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30'
                }`}
              >
                <span>Angka (0-9)</span>
                <span className="font-metric-label text-xs">
                  {settings.includeNumbers ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
