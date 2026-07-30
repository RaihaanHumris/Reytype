import { useEffect, useRef, useState } from 'react';

export default function PracticeView({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
  timeLeft,
  totalTime,
  isRunning,
  stats,
  settings,
  onSettingsChange,
  onKeyDown,
  capsLockActive,
}) {
  const containerRef = useRef(null);
  const activeWordRef = useRef(null);

  // Custom Time Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState("60");
  const [customTimeUnit, setCustomTimeUnit] = useState("seconds");

  // Auto-focus logic
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [words]);

  // Keep active word in view
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentWordIndex]);

  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  // Render dummy live stats if not finished
  const currentWpm = stats ? stats.wpm : 0;
  const currentAcc = stats ? stats.accuracy : 100;

  const handleCustomTimeClick = () => {
    setShowCustomModal(true);
  };

  const handleCustomTimeSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customTimeValue);
    if (!isNaN(val) && val > 0) {
      const seconds = customTimeUnit === 'minutes' ? val * 60 : val;
      onSettingsChange({ ...settings, time: seconds, isCustomTime: true });
      setShowCustomModal(false);
    }
  };

  // Calculate dynamic line count based on font size
  const dynamicLineCount = settings.fontSize === 24 ? 4 : settings.fontSize === 40 ? 2 : 3;

  return (
    <div className="max-w-container-max w-full">
      {/* Progress Line */}
      <div className="w-full h-0.5 bg-surface-container-highest mb-stack-md rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-fixed transition-all duration-500 shadow-[0_0_8px_rgba(195,244,0,0.6)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header Controls & Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-stack-md gap-6 w-full">
        
        {/* Quick Settings Group */}
        <div className="flex flex-col gap-4">
          {/* Duration Toggle */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/30 flex-wrap w-fit">
            {[15, 30, 60, 120].map((t) => (
              <button
                key={t}
                onClick={() => onSettingsChange({ ...settings, time: t, isCustomTime: false })}
                className={`px-4 py-1 font-metric-label text-metric-label rounded-md transition-all ${
                  settings.time === t && !settings.isCustomTime
                    ? 'text-primary-fixed bg-surface-variant'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={handleCustomTimeClick}
              className={`px-4 py-1 font-metric-label text-metric-label transition-all flex items-center gap-1 rounded-md ${
                settings.isCustomTime
                  ? 'text-primary-fixed bg-surface-variant'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]" data-icon="edit">
                edit
              </span>{' '}
              CUSTOM
            </button>
          </div>

          <div className="flex gap-4">
            {/* Font Size Toggle */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/30 flex-wrap w-fit">
              <span className="px-3 text-on-tertiary-container font-metric-label text-[10px]">SIZE</span>
              {[24, 32, 40].map((size) => (
                <button
                  key={size}
                  onClick={() => onSettingsChange({ ...settings, fontSize: size })}
                  className={`px-3 py-1 font-metric-label text-metric-label rounded-md transition-all ${
                    settings.fontSize === size
                      ? 'text-primary-fixed bg-surface-variant'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {size === 24 ? 'S' : size === 32 ? 'M' : 'L'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex gap-8 md:gap-12 mt-4 md:mt-0">
          <div className="flex flex-col">
            <span className="font-metric-label text-metric-label text-on-tertiary-container uppercase tracking-widest">
              WPM
            </span>
            <span className="font-metric-value text-metric-value text-primary">
              {currentWpm}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-metric-label text-metric-label text-on-tertiary-container uppercase tracking-widest">
              ACCURACY
            </span>
            <span className="font-metric-value text-metric-value text-primary">
              {currentAcc}
              <span className="text-secondary text-lg">%</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-metric-label text-metric-label text-on-tertiary-container uppercase tracking-widest">
              TIME
            </span>
            <span className="font-metric-value text-metric-value text-primary-fixed">
              {timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Caps Lock Warning */}
      {capsLockActive && (
        <div className="w-full mb-4 bg-error-container/20 text-error border border-error/50 rounded-lg py-2 px-4 flex items-center justify-center gap-2 animate-fade-in shadow-[0_0_15px_rgba(255,180,171,0.2)]">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span className="font-metric-label font-bold tracking-wide">CAPSLOCK NYALA</span>
        </div>
      )}

      {/* The Stage: Typing Area */}
      <div className="relative bg-surface-container p-12 rounded-xl border border-outline-variant/10 focus-within:border-primary-fixed/30 transition-all focus-outline">
        <div
          ref={containerRef}
          onKeyDown={onKeyDown}
          tabIndex={0}
          id="typing-canvas"
          className="font-display-typing text-left select-none outline-none overflow-hidden relative"
          style={{ 
            fontSize: `${settings.fontSize}px`,
            lineHeight: 1.5,
            height: `${(settings.fontSize * 1.5 + 8) * dynamicLineCount}px` 
          }}
        >
          <div className="absolute inset-0 overflow-y-auto pr-4 pointer-events-none">
            {words.map((word, wordIdx) => (
              <span
                key={wordIdx}
                ref={wordIdx === currentWordIndex ? activeWordRef : null}
                className="relative inline-block mr-4 mb-2"
              >
                {word.split('').map((char, charIdx) => {
                  let charClass = 'typing-word-untyped';
                  if (wordIdx < currentWordIndex) {
                    const typedWord = typedChars[wordIdx] || '';
                    if (charIdx < typedWord.length) {
                      charClass =
                        typedWord[charIdx] === char
                          ? 'typing-word-correct'
                          : 'typing-word-incorrect';
                    }
                  } else if (wordIdx === currentWordIndex) {
                    if (charIdx < currentCharIndex) {
                      const currentTyped = typedChars[wordIdx] || '';
                      charClass =
                        currentTyped[charIdx] === char
                          ? 'typing-word-correct'
                          : 'typing-word-incorrect';
                    }
                  }
                  return (
                    <span key={charIdx} className={charClass}>
                      {char}
                    </span>
                  );
                })}

                {/* Extra typed characters */}
                {typedChars[wordIdx] && typedChars[wordIdx].length > word.length && (
                  <span className="typing-word-incorrect opacity-70">
                    {typedChars[wordIdx].slice(word.length)}
                  </span>
                )}

                {/* Caret */}
                {wordIdx === currentWordIndex && (
                  <div
                    className="absolute bottom-[4px] w-[2px] bg-primary-fixed caret-glow animate-caret transition-all"
                    style={{
                      height: `${settings.fontSize * 1.2}px`,
                      left: `${Math.min(currentCharIndex, word.length) * (settings.fontSize * 0.6)}px`, // monospace character width
                      display: isRunning || currentCharIndex > 0 ? 'block' : 'block',
                    }}
                  />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Overlay when not focused */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-surface-container/80 backdrop-blur-sm rounded-xl cursor-pointer opacity-0 focus-within:opacity-0 focus-within:pointer-events-none transition-opacity"
          onClick={() => containerRef.current?.focus()}
        >
          <span className="font-body-lg text-on-surface-variant border border-outline-variant/30 px-6 py-3 rounded-lg">
            Click here to focus
          </span>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="mt-stack-md flex justify-center items-center gap-4 text-on-surface-variant/60 font-body-sm">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 text-xs font-metric-label">
            TAB
          </kbd>
          <span>to restart</span>
        </div>
        <span className="opacity-30">|</span>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 text-xs font-metric-label">
            ESC
          </kbd>
          <span>to pause session</span>
        </div>
      </div>

      {/* Custom Time Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant shadow-2xl w-full max-w-sm animate-scale-in-center">
            <h3 className="text-xl font-headline-md text-on-surface mb-4">Set Waktu Custom</h3>
            <form onSubmit={handleCustomTimeSubmit}>
              <div className="flex gap-4 mb-6">
                <input
                  type="number"
                  min="1"
                  value={customTimeValue}
                  onChange={(e) => setCustomTimeValue(e.target.value)}
                  placeholder="Angka"
                  className="w-full min-w-0 bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-fixed"
                  required
                />
                <select
                  value={customTimeUnit}
                  onChange={(e) => setCustomTimeUnit(e.target.value)}
                  className="bg-surface-container-highest border border-outline-variant rounded-lg px-2 py-2 text-on-surface focus:outline-none focus:border-primary-fixed cursor-pointer"
                >
                  <option value="seconds">Detik</option>
                  <option value="minutes">Menit</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant font-metric-label hover:bg-surface-variant transition-colors"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-metric-label hover:opacity-90 transition-opacity"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
