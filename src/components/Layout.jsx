import { useState } from 'react';
import TopNav from './TopNav';
import SideNav from './SideNav';
import Footer from './Footer';

export default function Layout({
  children,
  currentView,
  setView,
  settings,
  onSettingsChange,
  profile,
  onProfileChange,
}) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [draftName, setDraftName] = useState(profile?.name || 'Pengetik');
  const [draftSchool, setDraftSchool] = useState(profile?.school || 'MAKN Ende');
  const [draftGoalWpm, setDraftGoalWpm] = useState(String(profile?.goalWpm || 60));

  const handleOpenProfile = () => {
    setDraftName(profile?.name || 'Pengetik');
    setDraftSchool(profile?.school || 'MAKN Ende');
    setDraftGoalWpm(String(profile?.goalWpm || 60));
    setShowProfileModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const cleanName = draftName.trim() || 'Pengetik';
    const cleanSchool = draftSchool.trim() || 'Umum';
    const parsedGoal = Math.max(10, Math.min(250, parseInt(draftGoalWpm, 10) || 60));
    onProfileChange({
      name: cleanName,
      school: cleanSchool,
      goalWpm: parsedGoal,
    });
    setShowProfileModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <TopNav
        currentView={currentView}
        setView={setView}
        profile={profile}
        onOpenProfile={handleOpenProfile}
      />
      <SideNav
        currentView={currentView}
        setView={setView}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
      <main className="ml-0 md:ml-20 flex-1 flex flex-col items-center px-gutter py-8 md:py-12">
        {children}
      </main>
      <div className="ml-0 md:ml-20">
        <Footer setView={setView} />
      </div>

      {/* Player Profile Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-surface-container p-6 rounded-xl border border-outline-variant/40 w-full max-w-md animate-scale-in-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20">
              <h3 className="font-headline-md text-xl text-primary">Profil Pengetik</h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block font-metric-label text-xs text-on-tertiary-container mb-1.5">
                  NAMA PENGETIK
                </label>
                <input
                  type="text"
                  maxLength={28}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed font-body-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-metric-label text-xs text-on-tertiary-container mb-1.5">
                  SEKOLAH / KELAS / KOMUNITAS
                </label>
                <input
                  type="text"
                  maxLength={32}
                  value={draftSchool}
                  onChange={(e) => setDraftSchool(e.target.value)}
                  placeholder="Contoh: MAKN Ende - Kelas XI"
                  className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed font-body-sm"
                />
              </div>

              <div>
                <label className="block font-metric-label text-xs text-on-tertiary-container mb-1.5">
                  TARGET KECEPATAN (WPM)
                </label>
                <input
                  type="number"
                  min={10}
                  max={250}
                  value={draftGoalWpm}
                  onChange={(e) => setDraftGoalWpm(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed font-body-sm tabular-nums"
                  required
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  Skor latihan Anda akan tercatat menggunakan nama profil ini di Peringkat dan
                  Riwayat.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant font-metric-label text-xs hover:bg-surface-variant transition-colors cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-metric-label text-xs hover:brightness-110 transition-all cursor-pointer"
                >
                  SIMPAN PROFIL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
