import { useState } from 'react';

export default function Footer({ setView }) {
  const [infoModal, setInfoModal] = useState(null);

  return (
    <footer className="w-full py-6 mt-auto bg-surface border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto w-full gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display-typing text-primary-fixed font-bold">ReyType</span>
          <span className="text-outline-variant">·</span>
          <span className="text-on-surface-variant text-body-sm">
            © 2026 Muhammad Raihaan Humris · MAKN Mengetik
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setInfoModal('guide')}
            className="text-body-sm text-on-surface-variant hover:text-primary-fixed transition-colors cursor-pointer whitespace-nowrap"
          >
            Panduan 10 Jari
          </button>
          <button
            type="button"
            onClick={() => setInfoModal('shortcuts')}
            className="text-body-sm text-on-surface-variant hover:text-primary-fixed transition-colors cursor-pointer whitespace-nowrap"
          >
            Pintasan Keyboard
          </button>
          <button
            type="button"
            onClick={() => setInfoModal('about')}
            className="text-body-sm text-on-surface-variant hover:text-primary-fixed transition-colors cursor-pointer whitespace-nowrap"
          >
            Tentang
          </button>
        </div>
      </div>

      {/* Info Modal */}
      {infoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setInfoModal(null)}
        >
          <div
            className="bg-surface-container p-6 rounded-xl border border-outline-variant/40 w-full max-w-lg animate-scale-in-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20">
              <h3 className="font-headline-md text-xl text-primary">
                {infoModal === 'guide' && 'Panduan Mengetik 10 Jari (Home Row)'}
                {infoModal === 'shortcuts' && 'Pintasan Keyboard Cepat'}
                {infoModal === 'about' && 'Tentang ReyType'}
              </h3>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {infoModal === 'guide' && (
              <div className="space-y-3 text-body-sm text-on-surface leading-relaxed">
                <p>
                  Letakkan jari-jari Anda pada baris tengah (<strong>Home Row</strong>) dengan
                  tonjolan kecil pada tombol <strong>F</strong> dan <strong>J</strong> sebagai
                  patokan jari telunjuk:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/25">
                    <div className="font-metric-label text-xs text-primary-fixed mb-1.5">
                      TANGAN KIRI
                    </div>
                    <ul className="space-y-1 text-xs text-on-surface-variant">
                      <li>Kelingking: A, Q, Z, 1</li>
                      <li>Jari Manis: S, W, X, 2</li>
                      <li>Jari Tengah: D, E, C, 3</li>
                      <li>Telunjuk: F, G, R, T, V, B, 4, 5</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/25">
                    <div className="font-metric-label text-xs text-secondary-fixed-dim mb-1.5">
                      TANGAN KANAN
                    </div>
                    <ul className="space-y-1 text-xs text-on-surface-variant">
                      <li>Telunjuk: J, H, U, Y, N, M, 6, 7</li>
                      <li>Jari Tengah: K, I, koma (,), 8</li>
                      <li>Jari Manis: L, O, titik (.), 9</li>
                      <li>Kelingking: ;, P, /, -, 0</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Gunakan kedua <strong>Ibu Jari</strong> secara bergantian untuk menekan tombol{' '}
                  <strong>Spasi</strong>. Aktifkan fitur <em>Virtual Keyboard</em> di area latihan
                  untuk melihat panduan jari secara langsung.
                </p>
              </div>
            )}

            {infoModal === 'shortcuts' && (
              <div className="space-y-3 text-body-sm text-on-surface">
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span>Mulai Ulang Sesi (Restart Cepat)</span>
                  <kbd className="px-2.5 py-1 rounded bg-surface-container-highest border border-outline-variant/30 font-metric-label text-xs text-primary-fixed">
                    TAB
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span>Jeda / Lanjutkan Sesi (Pause / Resume)</span>
                  <kbd className="px-2.5 py-1 rounded bg-surface-container-highest border border-outline-variant/30 font-metric-label text-xs text-primary-fixed">
                    ESC
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
                  <span>Hapus Seluruh Kata Saat Ini</span>
                  <kbd className="px-2.5 py-1 rounded bg-surface-container-highest border border-outline-variant/30 font-metric-label text-xs text-primary-fixed">
                    CTRL + BACKSPACE
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Kembali ke Kata Sebelumnya yang Salah</span>
                  <kbd className="px-2.5 py-1 rounded bg-surface-container-highest border border-outline-variant/30 font-metric-label text-xs text-primary-fixed">
                    BACKSPACE
                  </kbd>
                </div>
              </div>
            )}

            {infoModal === 'about' && (
              <div className="space-y-3 text-body-sm text-on-surface leading-relaxed">
                <p>
                  <strong>ReyType (MAKN Mengetik)</strong> adalah platform latihan dan pengujian
                  kecepatan mengetik interaktif yang dirancang untuk melatih pelajar, anak-anak,
                  maupun pengetik profesional.
                </p>
                <p className="text-on-surface-variant text-xs">
                  Dilengkapi dengan kosakata Bahasa Indonesia, Bahasa Inggris, Mode Pemula/Anak,
                  Mode Pemrograman (Coding), Kutipan Inspiratif, Papan Ketik Virtual 10 Jari,
                  serta analisis grafik performa real-time.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              {infoModal === 'guide' && setView && (
                <button
                  type="button"
                  onClick={() => {
                    setInfoModal(null);
                    setView('practice');
                  }}
                  className="px-4 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-metric-label text-xs cursor-pointer"
                >
                  MULAI LATIHAN
                </button>
              )}
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="px-4 py-2 rounded-lg bg-surface-variant text-on-surface font-metric-label text-xs hover:bg-surface-bright cursor-pointer"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
