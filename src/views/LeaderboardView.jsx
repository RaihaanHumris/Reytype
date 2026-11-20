import { useState, useMemo } from 'react';
import { getPerformanceRating } from '../utils/typing';

const BENCHMARK_LEADERS = [
  { id: 'b1', name: 'Raihaan Humris', school: 'MAKN Ende', wpm: 128, acc: 99, duration: 60, language: 'id' },
  { id: 'b2', name: 'Aulia Pratama', school: 'MAKN Ende', wpm: 116, acc: 98, duration: 30, language: 'id' },
  { id: 'b3', name: 'Rizky Ramadhan', school: 'SMKN 1 Surabaya', wpm: 112, acc: 97, duration: 60, language: 'en' },
  { id: 'b4', name: 'Nabila Azzahra', school: 'MAKN Ende', wpm: 104, acc: 99, duration: 15, language: 'id' },
  { id: 'b5', name: 'Fajar Nugroho', school: 'MAN Insan Cendekia', wpm: 98, acc: 96, duration: 60, language: 'id' },
  { id: 'b6', name: 'Siti Nurhaliza', school: 'MAKN Ende', wpm: 92, acc: 98, duration: 30, language: 'id' },
  { id: 'b7', name: 'Dimas Aditya', school: 'SMA Negeri 3', wpm: 86, acc: 95, duration: 120, language: 'en' },
  { id: 'b8', name: 'Putri Maharani', school: 'MAKN Ende', wpm: 79, acc: 97, duration: 15, language: 'id' },
  { id: 'b9', name: 'Bagas Saputra', school: 'SMPN 1 Ende', wpm: 68, acc: 96, duration: 30, language: 'id' },
  { id: 'b10', name: 'Zahra Khairunnisa', school: 'MAKN Ende', wpm: 58, acc: 98, duration: 15, language: 'id' },
];

export default function LeaderboardView({ profile, setView }) {
  const [history] = useState(() => {
    try {
      const saved = localStorage.getItem('typerush_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [durationFilter, setDurationFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Merge user's best recorded sessions with benchmark leaderboard entries
  const rankedLeaders = useMemo(() => {
    const userEntries = history
      .filter((h) => h.wpm > 0)
      .map((h, idx) => ({
        id: `user-${idx}`,
        name: h.playerName || profile?.name || 'Guest',
        school: h.playerSchool || profile?.school || 'MAKN Ende',
        wpm: h.wpm,
        acc: h.accuracy,
        duration: h.timeElapsed || 15,
        language: h.language || 'id',
        isCurrentUser: true,
        date: h.date,
      }));

    // Keep best score per (name + duration + language) combination so table stays clean
    const combined = [...BENCHMARK_LEADERS, ...userEntries];
    const filtered = combined.filter((entry) => {
      if (durationFilter !== 'all' && entry.duration !== Number(durationFilter)) {
        return false;
      }
      if (langFilter !== 'all' && entry.language !== langFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = entry.name.toLowerCase().includes(q);
        const matchSchool = (entry.school || '').toLowerCase().includes(q);
        if (!matchName && !matchSchool) return false;
      }
      return true;
    });

    // Deduplicate by player name keeping their highest WPM (and accuracy tie-breaker)
    const bestByPlayer = new Map();
    for (const item of filtered) {
      const key = `${item.name.toLowerCase()}-${item.isCurrentUser ? 'me' : 'bench'}`;
      const existing = bestByPlayer.get(key);
      if (
        !existing ||
        item.wpm > existing.wpm ||
        (item.wpm === existing.wpm && item.acc > existing.acc)
      ) {
        bestByPlayer.set(key, item);
      }
    }

    return Array.from(bestByPlayer.values())
      .sort((a, b) => (b.wpm !== a.wpm ? b.wpm - a.wpm : b.acc - a.acc))
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
  }, [history, profile, durationFilter, langFilter, searchQuery]);

  const userBestRank = useMemo(() => {
    return rankedLeaders.find((r) => r.isCurrentUser);
  }, [rankedLeaders]);

  return (
    <div className="max-w-container-max w-full flex flex-col gap-6">
      {/* User's Current Standing Banner */}
      <div className="bg-surface-container border border-outline-variant/25 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-metric-label text-xs text-on-tertiary-container tracking-wider">
            POSISI PERINGKAT ANDA ({profile?.name || 'Guest'})
          </div>
          {userBestRank ? (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="font-headline-md text-2xl text-primary-fixed font-bold tabular-nums">
                Peringkat #{userBestRank.rank}
              </span>
              <span className="text-outline-variant">·</span>
              <span className="font-metric-value text-xl text-primary tabular-nums">
                {userBestRank.wpm} WPM
              </span>
              <span className="text-outline-variant">·</span>
              <span className="font-body-sm text-sm text-on-surface-variant tabular-nums">
                Akurasi {userBestRank.acc}%
              </span>
            </div>
          ) : (
            <p className="font-body-sm text-sm text-on-surface-variant mt-1">
              Selesaikan minimal 1 sesi latihan mengetik untuk mencatatkan skor Anda di papan
              peringkat!
            </p>
          )}
        </div>

        {setView && (
          <button
            type="button"
            onClick={() => setView('practice')}
            className="px-5 py-2.5 rounded-lg bg-primary-fixed text-on-primary-fixed font-metric-label text-xs hover:brightness-110 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            TINGKATKAN SKOR
          </button>
        )}
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-surface-container rounded-xl p-6 sm:p-8 border border-outline-variant/25">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="font-headline-md text-primary text-2xl">
              Papan Peringkat Pengetik
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Peringkat kecepatan terbaik komunitas MAKN Mengetik & sesi lokal Anda
            </p>
          </div>

          {/* Interactive Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama / sekolah..."
                className="w-full sm:w-48 bg-surface-container-low border border-outline-variant/30 rounded-lg pl-3 pr-8 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary-fixed"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>

            {/* Duration Filter */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/25">
              {[
                { id: 'all', label: 'Semua' },
                { id: '15', label: '15s' },
                { id: '30', label: '30s' },
                { id: '60', label: '60s' },
                { id: '120', label: '120s' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDurationFilter(d.id)}
                  className={`px-2.5 py-1 font-metric-label text-xs rounded-md transition-colors cursor-pointer tabular-nums whitespace-nowrap ${
                    durationFilter === d.id
                      ? 'bg-surface-variant text-primary-fixed font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Language Filter */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/25">
              {[
                { id: 'all', label: 'All' },
                { id: 'id', label: 'ID' },
                { id: 'en', label: 'EN' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLangFilter(l.id)}
                  className={`px-2.5 py-1 font-metric-label text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    langFilter === l.id
                      ? 'bg-surface-variant text-primary-fixed font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {rankedLeaders.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <p className="font-body-lg">
              Tidak ada data peringkat yang cocok dengan filter pencarian.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-tertiary-container font-metric-label text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4 w-16">Rank</th>
                  <th className="pb-3 px-4">Pengetik</th>
                  <th className="pb-3 px-4">Kategori & Level</th>
                  <th className="pb-3 px-4 text-right">WPM</th>
                  <th className="pb-3 pl-4 text-right">Akurasi</th>
                </tr>
              </thead>
              <tbody>
                {rankedLeaders.map((leader) => {
                  const rating = getPerformanceRating(leader.wpm);
                  return (
                    <tr
                      key={leader.id}
                      className={`border-b border-outline-variant/10 transition-colors ${
                        leader.isCurrentUser
                          ? 'bg-primary-fixed/10 hover:bg-primary-fixed/15'
                          : 'hover:bg-surface-variant/25'
                      }`}
                    >
                      <td className="py-3.5 pr-4 font-metric-value text-base tabular-nums">
                        <span
                          className={
                            leader.rank === 1
                              ? 'text-primary-fixed font-bold'
                              : leader.rank <= 3
                              ? 'text-secondary-fixed-dim font-semibold'
                              : 'text-on-surface-variant'
                          }
                        >
                          #{leader.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-body-lg text-base text-on-surface font-semibold">
                            {leader.name}
                          </span>
                          {leader.isCurrentUser && (
                            <span className="font-metric-label text-[11px] text-primary-fixed">
                              · ANDA
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {leader.school || 'Umum'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-body-sm text-xs text-on-surface-variant">
                        <span style={{ color: rating.color }} className="font-semibold">
                          {rating.label}
                        </span>
                        <span className="mx-1.5">·</span>
                        <span className="tabular-nums">{leader.duration}s</span>
                        <span className="mx-1.5">·</span>
                        <span className="uppercase">{leader.language}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-metric-value text-xl text-primary-fixed tabular-nums">
                        {leader.wpm}
                      </td>
                      <td className="py-3.5 pl-4 text-right font-metric-value text-base text-primary tabular-nums">
                        {leader.acc}%
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
