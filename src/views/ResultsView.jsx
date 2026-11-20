import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  calculateConsistency,
  getPerformanceRating,
  getFingerInfo,
} from '../utils/typing';
import { getThemeById } from '../utils/themes';

export default function ResultsView({
  stats,
  chartData,
  settings,
  missedKeys = {},
  isNewPersonalBest,
  onRestart,
  setView,
}) {
  if (!stats) return null;

  const consistency = calculateConsistency(chartData);
  const rating = getPerformanceRating(stats.wpm);
  const activeTheme = getThemeById(settings?.theme);
  const chartColors = activeTheme.chart;

  const topMissedKeys = Object.entries(missedKeys)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const modeLabel =
    settings?.mode === 'words'
      ? `${settings.wordCount || 25} Kata`
      : settings?.mode === 'quote'
      ? 'Kutipan'
      : `Waktu ${settings?.time || stats.timeElapsed}s`;

  const langLabel =
    settings?.difficulty === 'code'
      ? 'Coding'
      : settings?.language === 'en'
      ? 'English'
      : 'Bahasa Indonesia';

  return (
    <div className="max-w-container-max w-full flex flex-col gap-6 animate-fade-in">
      {/* Performance Tier Header */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-display-typing text-2xl font-bold shrink-0"
            style={{ color: rating.color }}
          >
            {rating.tier}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-headline-md text-2xl text-primary font-bold">
                Level: {rating.label}
              </h2>
              {isNewPersonalBest && (
                <span className="font-metric-label text-xs text-primary-fixed">
                  · REKOR PRIBADI BARU
                </span>
              )}
            </div>
            <p className="font-body-sm text-on-surface-variant mt-0.5">
              {rating.sublabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-metric-label text-xs text-on-surface-variant">
          <span>{modeLabel}</span>
          <span>·</span>
          <span>{langLabel}</span>
          <span>·</span>
          <span className="tabular-nums">{stats.timeElapsed}s</span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-6 flex flex-col justify-between">
          <span className="font-metric-label text-xs text-on-tertiary-container tracking-widest">
            NET WPM
          </span>
          <span className="font-metric-value text-5xl sm:text-6xl text-primary-fixed tabular-nums mt-2">
            {stats.wpm}
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant mt-2">
            Kecepatan bersih
          </span>
        </div>

        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-6 flex flex-col justify-between">
          <span className="font-metric-label text-xs text-on-tertiary-container tracking-widest">
            ACCURACY
          </span>
          <span className="font-metric-value text-5xl sm:text-6xl text-primary tabular-nums mt-2">
            {stats.accuracy}
            <span className="text-2xl text-secondary">%</span>
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant mt-2">
            Ketepatan ketukan
          </span>
        </div>

        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-6 flex flex-col justify-between">
          <span className="font-metric-label text-xs text-on-tertiary-container tracking-widest">
            RAW WPM
          </span>
          <span className="font-metric-value text-4xl sm:text-5xl text-on-surface tabular-nums mt-2">
            {stats.rawWpm}
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant mt-2">
            Kecepatan kotor
          </span>
        </div>

        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-6 flex flex-col justify-between">
          <span className="font-metric-label text-xs text-on-tertiary-container tracking-widest">
            CONSISTENCY
          </span>
          <span className="font-metric-value text-4xl sm:text-5xl text-secondary-fixed-dim tabular-nums mt-2">
            {consistency}
            <span className="text-2xl">%</span>
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant mt-2">
            Kestabilan ritme
          </span>
        </div>
      </div>

      {/* Character Breakdown & Missed Keys Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-6">
          <h3 className="font-metric-label text-xs text-on-tertiary-container tracking-widest mb-4">
            RINCIAN KARAKTER & KATA
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="font-metric-value text-2xl text-primary-fixed tabular-nums">
                {stats.correctChars}
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">Karakter Benar</div>
            </div>
            <div>
              <div className="font-metric-value text-2xl text-error tabular-nums">
                {stats.incorrectChars}
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">Karakter Salah</div>
            </div>
            <div>
              <div className="font-metric-value text-2xl text-on-surface tabular-nums">
                {stats.extraChars || 0}
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">Karakter Ekstra</div>
            </div>
            <div>
              <div className="font-metric-value text-2xl text-secondary tabular-nums">
                {stats.wordsCompleted}
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">Kata Selesai</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-6">
          <h3 className="font-metric-label text-xs text-on-tertiary-container tracking-widest mb-4">
            EVALUASI TOMBOL SERING MELESET
          </h3>
          {topMissedKeys.length === 0 ? (
            <div className="flex items-center gap-3 text-body-sm text-on-surface">
              <span className="material-symbols-outlined text-primary-fixed">
                verified
              </span>
              <span>Sempurna! Tidak ada tombol yang salah ketik pada sesi ini.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {topMissedKeys.map(([keyChar, count]) => {
                const finger = getFingerInfo(keyChar);
                return (
                  <div
                    key={keyChar}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  >
                    <span className="w-8 h-8 rounded bg-error-container/30 border border-error/40 text-error font-display-typing text-sm uppercase flex items-center justify-center font-bold">
                      {keyChar === ' ' ? '␣' : keyChar}
                    </span>
                    <div className="text-xs">
                      <div className="text-on-surface font-semibold tabular-nums">
                        {count}x meleset
                      </div>
                      <div className="text-on-surface-variant">
                        {finger?.label || 'Jari'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Performance Chart */}
      {chartData && chartData.length > 0 && (
        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-lg text-on-surface">
              Grafik Performa Real-Time
            </h3>
            <span className="font-metric-label text-xs text-on-surface-variant">
              WPM & Akurasi per Detik
            </span>
          </div>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 16, left: -16, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke={chartColors.tick}
                  tick={{
                    fill: chartColors.tick,
                    fontSize: 12,
                    fontFamily: 'JetBrains Mono',
                  }}
                  tickFormatter={(value) => `${value}s`}
                />
                <YAxis
                  yAxisId="left"
                  stroke={chartColors.tick}
                  tick={{
                    fill: chartColors.tick,
                    fontSize: 12,
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  stroke={chartColors.tick}
                  tick={{
                    fill: chartColors.tick,
                    fontSize: 12,
                    fontFamily: 'JetBrains Mono',
                  }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    borderRadius: '8px',
                  }}
                  itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  labelStyle={{ color: chartColors.tooltipText, marginBottom: '6px' }}
                  labelFormatter={(label) => `Detik ke-${label}`}
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: 'Hanken Grotesk',
                    paddingTop: '12px',
                    fontSize: '13px',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="wpm"
                  name="Net WPM"
                  stroke={chartColors.primary}
                  strokeWidth={3}
                  dot={{ r: 3, fill: activeTheme.preview.bg, stroke: chartColors.primary, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: chartColors.primary, stroke: activeTheme.preview.bg, strokeWidth: 2 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rawWpm"
                  name="Raw WPM"
                  stroke={chartColors.raw}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  name="Akurasi (%)"
                  stroke={chartColors.secondary}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: activeTheme.preview.bg, stroke: chartColors.secondary, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: chartColors.secondary, stroke: activeTheme.preview.bg, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <button
          type="button"
          onClick={() => {
            onRestart();
            setView('practice');
          }}
          className="px-7 py-3 bg-primary-fixed text-on-primary-fixed font-headline-md text-base rounded-lg transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">keyboard</span>
          Latihan Lagi (Tab)
        </button>
        <button
          type="button"
          onClick={() => setView('leaderboard')}
          className="px-7 py-3 bg-surface-variant text-on-surface font-headline-md text-base rounded-lg transition-all hover:bg-surface-bright active:scale-95 border border-outline-variant/30 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">leaderboard</span>
          Papan Peringkat
        </button>
        <button
          type="button"
          onClick={() => setView('history')}
          className="px-7 py-3 bg-surface-container-high text-on-surface font-headline-md text-base rounded-lg transition-all hover:bg-surface-variant active:scale-95 border border-outline-variant/30 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          Riwayat Sesi
        </button>
      </div>
    </div>
  );
}
