import { getFingerInfo } from '../utils/typing';

const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const HOME_ROW_KEYS = new Set(['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);

export default function VirtualKeyboard({ targetChar, lastPressedKey, missedKeys = {} }) {
  const normalizedTarget = targetChar ? targetChar.toLowerCase() : '';
  const normalizedLast = lastPressedKey ? lastPressedKey.toLowerCase() : '';
  const fingerInfo = getFingerInfo(normalizedTarget || ' ');

  return (
    <div className="mt-6 bg-surface-container-low border border-outline-variant/25 rounded-xl p-5 select-none">
      {/* Top Bar: Finger Guide Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-outline-variant/15">
        <div className="flex items-center gap-3">
          <span className="font-metric-label text-xs text-on-tertiary-container tracking-wider">
            PANDUAN 10 JARI
          </span>
          <span className="text-outline-variant">·</span>
          <span className="font-body-sm text-on-surface">
            Target Tombol:{' '}
            <strong className="font-display-typing text-primary-fixed px-2 py-0.5 bg-surface-container-high rounded border border-outline-variant/30">
              {targetChar === ' ' ? 'SPASI' : targetChar || '—'}
            </strong>
          </span>
        </div>

        {fingerInfo && (
          <div className="flex items-center gap-2 text-xs font-metric-label">
            <span className="text-on-surface-variant">Gunakan:</span>
            <span
              className="font-bold"
              style={{ color: fingerInfo.color }}
            >
              {fingerInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* Keyboard Layout */}
      <div className="flex flex-col items-center gap-1.5">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-center gap-1.5 w-full"
          >
            {row.map((key) => {
              const isTarget = normalizedTarget === key;
              const isPressed = normalizedLast === key;
              const isHomeKey = HOME_ROW_KEYS.has(key);
              const isBumpKey = key === 'f' || key === 'j';
              const missCount = missedKeys[key] || 0;
              const keyFinger = getFingerInfo(key);

              return (
                <div
                  key={key}
                  className={`relative flex flex-col items-center justify-center w-8 h-9 sm:w-11 sm:h-11 rounded-lg font-display-typing text-xs sm:text-sm uppercase transition-all duration-100 border ${
                    isTarget
                      ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed font-bold scale-105 shadow-[0_0_12px_rgba(195,244,0,0.45)]'
                      : isPressed
                      ? 'bg-surface-bright text-primary border-outline'
                      : missCount > 2
                      ? 'bg-error-container/25 text-error border-error/40'
                      : isHomeKey
                      ? 'bg-surface-container-high text-on-surface border-outline-variant/40'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/20'
                  }`}
                >
                  <span>{key}</span>
                  {/* Tactile bump on F and J */}
                  {isBumpKey && (
                    <span
                      className={`w-3 h-0.5 rounded-full mt-0.5 ${
                        isTarget ? 'bg-on-primary-fixed' : 'bg-primary-fixed/70'
                      }`}
                    />
                  )}
                  {/* Subtle finger color underline bar */}
                  {!isTarget && keyFinger && (
                    <span
                      className="absolute bottom-1 w-4 h-[2px] rounded-full opacity-45"
                      style={{ backgroundColor: keyFinger.color }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Spacebar Row */}
        <div className="flex items-center justify-center w-full mt-1">
          <div
            className={`flex items-center justify-center w-48 sm:w-72 h-9 rounded-lg font-metric-label text-xs tracking-widest border transition-all duration-100 ${
              normalizedTarget === ' '
                ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed font-bold shadow-[0_0_12px_rgba(195,244,0,0.45)]'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/25'
            }`}
          >
            SPASI (IBU JARI)
          </div>
        </div>
      </div>
    </div>
  );
}
