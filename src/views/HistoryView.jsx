import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getThemeById } from '../utils/themes';

export default function HistoryView({ setView, settings }) {
  const chartColors = getThemeById(settings?.theme).chart;
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('typerush_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [filterMode, setFilterMode] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearHistory = () => {
    localStorage.removeItem('typerush_history');
    setHistory([]);
    setConfirmClear(false);
  };

  const handleDeleteEntry = (indexToRemove) => {
    const updated = history.filter((_, idx) => idx !== indexToRemove);
    setHistory(updated);
    localStorage.setItem('typerush_history', JSON.stringify(updated));
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Tanggal', 'Nama', 'Mode', 'Bahasa', 'WPM', 'Raw WPM', 'Akurasi (%)', 'Durasi (s)'];
    const rows = history.map((item) => [
      new Date(item.date).toLocaleString('id-ID'),
      item.playerName || 'Guest',
      item.mode || 'time',
      item.language || 'id',
      item.wpm,
      item.rawWpm || item.wpm,
      item.accuracy,
      item.timeElapsed,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reytype_riwayat_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = useMemo(() => {
    if (filterMode === 'all') return history;
    return history.filter((h) => (h.mode || 'time') === filterMode);
  }, [history, filterMode]);

  const summary = useMemo(() => {
    if (history.length === 0) {
      return { totalTests: 0, bestWpm: 0, avgWpm: 0, avgAcc: 0, totalSeconds: 0 };
    }
    const bestWpm = Math.max(...history.map((h) => h.wpm || 0));
    const avgWpm = Math.round(
      history.reduce((acc, h) => acc + (h.wpm || 0), 0) / history.length
    );
    const avgAcc = Math.round(
      history.reduce((acc, h) => acc + (h.accuracy || 0), 0) / history.length
    );
    const totalSeconds = history.reduce((acc, h) => acc + (h.timeElapsed || 0), 0);
    return {
      totalTests: history.length,
      bestWpm,
      avgWpm,
      avgAcc,
      totalSeconds,
    };
  }, [history]);

  const trendData = useMemo(() => {
    return [...filteredHistory]
      .slice(0, 20)
      .reverse()
      .map((item, idx) => ({
        session: `#${idx + 1}`,
        wpm: item.wpm,
        accuracy: item.accuracy,
      }));
  }, [filteredHistory]);

  return (
    <div className="max-w-container-max w-full flex flex-col gap-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-5">
          <div className="font-metric-label text-xs text-on-tertiary-container tracking-wider">
            TOTAL LATIHAN
          </div>
          <div className="font-metric-value text-3xl text-primary mt-2 tabular-nums">
            {summary.totalTests}
          </div>
          <div className="text-xs text-on-surface-variant mt-1 tabular-nums">
            Total waktu: {Math.round(summary.totalSeconds / 60)} menit ({summary.totalSeconds}s)
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-5">
          <div className="font-metric-label text-xs text-on-tertiary-container tracking-wider">
            REKOR TERTINGGI
          </div>
          <div className="font-metric-value text-3xl text-primary-fixed mt-2 tabular-nums">
            {summary.bestWpm} <span className="text-sm">WPM</span>
          </div>
          <div className="text-xs text-on-surface-variant mt-1">
            Kecepatan puncak tercatat
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-5">
          <div className="font-metric-label text-xs text-on-tertiary-container tracking-wider">
            RATA-RATA WPM
          </div>
          <div className="font-metric-value text-3xl text-secondary-fixed-dim mt-2 tabular-nums">
            {summary.avgWpm} <span className="text-sm">WPM</span>
          </div>
          <div className="text-xs text-on-surface-variant mt-1">
            Dari seluruh sesi selesai
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-5">
          <div className="font-metric-label text-xs text-on-tertiary-container tracking-wider">
            RATA-RATA AKURASI
          </div>
          <div className="font-metric-value text-3xl text-primary mt-2 tabular-nums">
            {summary.avgAcc}%
          </div>
          <div className="text-xs text-on-surface-variant mt-1">
            Konsistensi ketepatan
          </div>
        </div>
      </div>

      {/* Progression Trend Chart */}
      {trendData.length >= 2 && (
        <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-lg text-primary">
              Grafik Perkembangan Kecepatan (20 Sesi Terakhir)
            </h3>
            <span className="font-metric-label text-xs text-on-surface-variant">
              Tren WPM
            </span>
          </div>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="session"
                  stroke={chartColors.tick}
                  tick={{ fill: chartColors.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  stroke={chartColors.tick}
                  tick={{ fill: chartColors.tick, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    borderRadius: '8px',
                  }}
                  itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  labelStyle={{ color: chartColors.tooltipText }}
                />
                <Area
                  type="monotone"
                  dataKey="wpm"
                  name="WPM"
                  stroke={chartColors.primary}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#wpmGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main History Table Container */}
      <div className="bg-surface-container rounded-xl p-6 sm:p-8 border border-outline-variant/25">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="font-headline-md text-primary text-2xl">
              Riwayat Sesi Latihan
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Catatan detail performa mengetik Anda yang tersimpan di perangkat ini
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Filter */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/25">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'time', label: 'Waktu' },
                { id: 'words', label: 'Kata' },
                { id: 'quote', label: 'Kutipan' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1 font-metric-label text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    filterMode === tab.id
                      ? 'bg-surface-variant text-primary-fixed font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-variant text-on-surface border border-outline-variant/30 rounded-lg font-metric-label text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Unduh CSV
                </button>

                {!confirmClear ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="px-3.5 py-1.5 bg-error-container/40 text-error border border-error/30 rounded-lg font-metric-label text-xs hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Hapus Semua
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-error-container/20 border border-error/40 px-2.5 py-1 rounded-lg">
                    <span className="text-xs font-metric-label text-error">Yakin?</span>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="px-2 py-0.5 bg-error text-on-error rounded text-xs font-metric-label cursor-pointer"
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-0.5 bg-surface-variant text-on-surface rounded text-xs font-metric-label cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span
              className="material-symbols-outlined text-5xl mb-3 opacity-50"
              data-icon="history"
            >
              history
            </span>
            <p className="font-body-lg mb-4">
              Belum ada riwayat sesi latihan untuk kategori ini.
            </p>
            {setView && (
              <button
                type="button"
                onClick={() => setView('practice')}
                className="px-5 py-2.5 rounded-lg bg-primary-fixed text-on-primary-fixed font-metric-label text-xs hover:brightness-110 transition-all cursor-pointer"
              >
                MULAI TES PERTAMA
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-tertiary-container font-metric-label text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Waktu Sesi</th>
                  <th className="pb-3 px-4">Mode & Bahasa</th>
                  <th className="pb-3 px-4 text-right">Net WPM</th>
                  <th className="pb-3 px-4 text-right">Raw WPM</th>
                  <th className="pb-3 px-4 text-right">Akurasi</th>
                  <th className="pb-3 px-4 text-right">Durasi</th>
                  <th className="pb-3 pl-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((session, i) => {
                  const modeBadge =
                    session.mode === 'words'
                      ? 'Kata'
                      : session.mode === 'quote'
                      ? 'Kutipan'
                      : 'Waktu';
                  const langText =
                    session.difficulty === 'code'
                      ? 'Coding'
                      : session.language === 'en'
                      ? 'EN'
                      : 'ID';

                  return (
                    <tr
                      key={`${session.date}-${i}`}
                      className="border-b border-outline-variant/10 hover:bg-surface-variant/25 transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-body-sm text-sm text-on-surface tabular-nums">
                        {new Date(session.date).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-body-sm text-xs text-on-surface-variant">
                        <span>{modeBadge}</span>
                        <span className="mx-1.5">·</span>
                        <span>{langText}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-metric-value text-lg text-primary-fixed tabular-nums">
                        {session.wpm}
                      </td>
                      <td className="py-3.5 px-4 text-right font-metric-value text-base text-on-surface-variant tabular-nums">
                        {session.rawWpm || session.wpm}
                      </td>
                      <td className="py-3.5 px-4 text-right font-metric-value text-base text-primary tabular-nums">
                        {session.accuracy}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-metric-value text-sm text-on-surface-variant tabular-nums">
                        {session.timeElapsed}s
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(history.indexOf(session))}
                          className="text-on-tertiary-container hover:text-error transition-colors cursor-pointer p-1"
                          title="Hapus baris ini"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
