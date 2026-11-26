import { useEffect, useRef, useState } from 'react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { THEMES } from '../utils/themes';

export default function PracticeView({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
  timeLeft,
  totalTime,
  elapsedTime,
  isRunning,
  isPaused,
  stats,
  settings,
  onSettingsChange,
  onKeyDown,
  onMobileInput,
  onRestart,
  onTogglePause,
  capsLockActive,
  lastPressedKey,
  missedKeys,
  personalBest,
  customQuotes = [],
  onSaveCustomQuote,
  onDeleteCustomQuote,
  onSelectCustomQuote,
}) {
  const containerRef = useRef(null);
  const wordsScrollRef = useRef(null);
  const activeWordRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Focus state
  const [isFocused, setIsFocused] = useState(true);

  // Custom Time Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState('60');
  const [customTimeUnit, setCustomTimeUnit] = useState('seconds');

  // Custom Quote Modal State
  const [showCustomQuoteModal, setShowCustomQuoteModal] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [quoteTitleInput, setQuoteTitleInput] = useState('');
  const [quoteTextInput, setQuoteTextInput] = useState('');
  const [quoteFormError, setQuoteFormError] = useState('');

  const isAnyModalOpen = showCustomModal || showCustomQuoteModal;

  const focusStage = () => {
    if (isAnyModalOpen) return;
    if (mobileInputRef.current) {
      mobileInputRef.current.focus({ preventScroll: true });
    } else if (containerRef.current) {
      containerRef.current.focus({ preventScroll: true });
    }
    setIsFocused(true);
  };

  // Auto-focus DOM input when words reset or pause toggles off
  useEffect(() => {
    if (!isAnyModalOpen && !isPaused) {
      if (mobileInputRef.current) {
        mobileInputRef.current.focus({ preventScroll: true });
      } else if (containerRef.current) {
        containerRef.current.focus({ preventScroll: true });
      }
    }
  }, [words, isPaused, isAnyModalOpen]);

  // Keep active word centered inside the typing box WITHOUT scrolling the browser window
  useEffect(() => {
    const scrollBox = wordsScrollRef.current;
    const activeEl = activeWordRef.current;
    if (scrollBox && activeEl) {
      const boxHeight = scrollBox.clientHeight;
      const wordTop = activeEl.offsetTop;
      const wordHeight = activeEl.offsetHeight;
      const targetScroll = Math.max(0, wordTop - boxHeight / 2 + wordHeight / 2);
      scrollBox.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    }
  }, [currentWordIndex, settings.fontSize]);

  const mode = settings.mode || 'time';
  const progressPercent =
    mode === 'time'
      ? totalTime > 0
        ? ((totalTime - timeLeft) / totalTime) * 100
        : 0
      : words.length > 0
      ? (currentWordIndex / words.length) * 100
      : 0;

  const currentWpm = stats ? stats.wpm : 0;
  const currentRaw = stats ? stats.rawWpm : 0;
  const currentAcc = stats ? stats.accuracy : 100;

  const handleCustomTimeSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customTimeValue, 10);
    if (!isNaN(val) && val > 0) {
      const seconds = Math.min(3600, customTimeUnit === 'minutes' ? val * 60 : val);
      onSettingsChange({
        ...settings,
        mode: 'time',
        time: seconds,
        isCustomTime: true,
      });
      setShowCustomModal(false);
    }
  };

  // Determine the next target character for the Virtual Keyboard
  const currentWord = words[currentWordIndex] || '';
  const targetChar =
    currentCharIndex < currentWord.length ? currentWord[currentCharIndex] : ' ';

  const dynamicLineCount =
    settings.fontSize === 24 ? 4 : settings.fontSize === 40 ? 2 : 3;

  const caretStyle = settings.caretStyle || 'line';

  const renderCaret = () => {
    if (caretStyle === 'block') {
      return (
        <span
          className="inline-block w-[0.55em] bg-primary-fixed/40 border-b-2 border-primary-fixed animate-caret align-baseline -mr-[0.55em]"
          style={{ height: `${settings.fontSize * 1.1}px` }}
        />
      );
    }
    if (caretStyle === 'underline') {
      return (
        <span className="absolute left-0 right-0 -bottom-0.5 h-[3px] bg-primary-fixed caret-glow animate-caret" />
      );
    }
    return (
      <span
        className="absolute -left-[1.5px] top-[10%] w-[2.5px] bg-primary-fixed caret-glow animate-caret rounded-full"
        style={{ height: '80%' }}
      />
    );
  };

  return (
    <div className="max-w-container-max w-full">
      {/* Semantic SEO Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h1 className="font-headline-md text-sm sm:text-base font-bold text-primary tracking-tight">
          Latihan Mengetik MAKN Ende · Tes Kecepatan Mengetik 10 Jari
        </h1>
        <span className="font-body-sm text-xs text-on-surface-variant">
          Platform Latihan Mengetik Cepat Interaktif Bahasa Indonesia & Inggris
        </span>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1 bg-surface-container-highest mb-6 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-fixed transition-all duration-300 shadow-[0_0_8px_rgba(195,244,0,0.6)]"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      {/* Mode & Modifiers Toolbar */}
      <div className="flex flex-col gap-3 mb-6 bg-surface-container-low p-3 rounded-xl border border-outline-variant/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mode Selectors (Time / Words / Quote) */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
            {[
              { id: 'time', label: 'Waktu', icon: 'timer' },
              { id: 'words', label: 'Kata', icon: 'notes' },
              { id: 'quote', label: 'Kutipan', icon: 'format_quote' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSettingsChange({ ...settings, mode: m.id })}
                className={`px-3 py-1.5 font-metric-label text-xs rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  mode === m.id
                    ? 'text-on-primary-fixed bg-primary-fixed font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Mode Sub-Options */}
          {mode === 'time' && (
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/20 flex-wrap">
              {[15, 30, 60, 120].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    onSettingsChange({ ...settings, mode: 'time', time: t, isCustomTime: false })
                  }
                  className={`px-3 py-1 font-metric-label text-xs rounded-md transition-all cursor-pointer tabular-nums whitespace-nowrap shrink-0 ${
                    settings.time === t && !settings.isCustomTime
                      ? 'text-primary-fixed bg-surface-variant font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {t}s
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className={`px-3 py-1 font-metric-label text-xs transition-all flex items-center gap-1 rounded-md cursor-pointer whitespace-nowrap shrink-0 ${
                  settings.isCustomTime
                    ? 'text-primary-fixed bg-surface-variant font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                {settings.isCustomTime ? `${settings.time}s` : 'Custom'}
              </button>
            </div>
          )}

          {mode === 'words' && (
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
              {[10, 25, 50, 100].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() =>
                    onSettingsChange({ ...settings, mode: 'words', wordCount: count })
                  }
                  className={`px-3 py-1 font-metric-label text-xs rounded-md transition-all cursor-pointer tabular-nums whitespace-nowrap shrink-0 ${
                    (settings.wordCount || 25) === count
                      ? 'text-primary-fixed bg-surface-variant font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {count} Kata
                </button>
              ))}
            </div>
          )}

          {mode === 'quote' && (() => {
            const quoteSource = settings.quoteSource || 'builtin';
            const activeCustomQuote =
              quoteSource === 'custom'
                ? customQuotes.find((q) => q.id === settings.activeCustomQuoteId) ||
                  customQuotes[0] ||
                  null
                : null;

            const openNewQuoteModal = () => {
              setEditingQuoteId(null);
              setQuoteTitleInput('');
              setQuoteTextInput('');
              setQuoteFormError('');
              setShowCustomQuoteModal(true);
            };

            const openEditQuoteModal = (quote) => {
              setEditingQuoteId(quote.id);
              setQuoteTitleInput(quote.title || '');
              setQuoteTextInput(quote.text || '');
              setQuoteFormError('');
              setShowCustomQuoteModal(true);
            };

            return (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Quote Source Toggle: Bawaan vs Kutipan Saya */}
                <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        mode: 'quote',
                        quoteSource: 'builtin',
                      })
                    }
                    className={`px-2.5 py-1 font-metric-label text-xs rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      quoteSource === 'builtin'
                        ? 'text-primary-fixed bg-surface-variant font-bold'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    Bawaan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (customQuotes.length === 0) {
                        openNewQuoteModal();
                      } else {
                        onSettingsChange({
                          ...settings,
                          mode: 'quote',
                          quoteSource: 'custom',
                          activeCustomQuoteId:
                            settings.activeCustomQuoteId || customQuotes[0].id,
                        });
                      }
                    }}
                    className={`px-2.5 py-1 font-metric-label text-xs rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      quoteSource === 'custom'
                        ? 'text-primary-fixed bg-surface-variant font-bold'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    Kutipan Saya{customQuotes.length > 0 ? ` (${customQuotes.length})` : ''}
                  </button>
                </div>

                {quoteSource === 'builtin' ? (
                  <button
                    type="button"
                    onClick={onRestart}
                    className="px-3 py-1 rounded-md bg-surface-container hover:bg-surface-variant text-primary-fixed font-metric-label text-xs border border-outline-variant/30 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    Kutipan Baru
                  </button>
                ) : activeCustomQuote ? (
                  <button
                    type="button"
                    onClick={() => openEditQuoteModal(activeCustomQuote)}
                    className="px-3 py-1 rounded-md bg-surface-container hover:bg-surface-variant text-on-surface font-metric-label text-xs border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer max-w-[200px]"
                    title={`Ubah atau pilih kutipan: ${activeCustomQuote.title}`}
                  >
                    <span className="material-symbols-outlined text-[14px] text-primary-fixed shrink-0">
                      edit_note
                    </span>
                    <span className="truncate">{activeCustomQuote.title}</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={openNewQuoteModal}
                  className="px-3 py-1 rounded-md bg-primary-fixed/15 hover:bg-primary-fixed/25 text-primary-fixed font-metric-label text-xs border border-primary-fixed/40 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 font-bold"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Buat Kutipan
                </button>
              </div>
            );
          })()}

          {/* Language Quick Switch */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
            {[
              { id: 'id', label: 'Indonesia' },
              { id: 'en', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSettingsChange({ ...settings, language: lang.id })}
                className={`px-3 py-1 font-metric-label text-xs rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  settings.language === lang.id
                    ? 'text-primary-fixed bg-surface-variant font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Difficulty, Modifiers, Font Size, Virtual Keyboard */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/15">
          {/* Difficulty / Vocabulary Preset */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
            {[
              { id: 'standard', label: 'Standar' },
              { id: 'kids', label: 'Pemula / Anak' },
              { id: 'code', label: 'Coding' },
            ].map((diff) => (
              <button
                key={diff.id}
                type="button"
                disabled={mode === 'quote'}
                onClick={() => onSettingsChange({ ...settings, difficulty: diff.id })}
                className={`px-2.5 py-1 font-metric-label text-xs rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40 ${
                  (settings.difficulty || 'standard') === diff.id
                    ? 'text-primary-fixed bg-surface-variant font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          {/* Punctuation & Numbers Modifiers */}
          {mode !== 'quote' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    includePunctuation: !settings.includePunctuation,
                  })
                }
                className={`px-3 py-1 font-metric-label text-xs rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  settings.includePunctuation
                    ? 'bg-primary-fixed/15 text-primary-fixed border-primary-fixed/50 font-bold'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-primary'
                }`}
              >
                @ Tanda Baca
              </button>
              <button
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    includeNumbers: !settings.includeNumbers,
                  })
                }
                className={`px-3 py-1 font-metric-label text-xs rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  settings.includeNumbers
                    ? 'bg-primary-fixed/15 text-primary-fixed border-primary-fixed/50 font-bold'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-primary'
                }`}
              >
                # Angka
              </button>
            </div>
          )}

          {/* Right tools: Theme + Font Size + Virtual Keyboard Toggle */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Theme Quick Picker */}
            <div className="flex items-center bg-surface-container p-1 rounded-lg border border-outline-variant/20">
              {THEMES.map((t) => {
                const isSelected = (settings.theme || 'cyber-lime') === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSettingsChange({ ...settings, theme: t.id })}
                    className={`px-2 py-0.5 font-metric-label text-[11px] rounded transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'text-primary-fixed bg-surface-variant font-bold'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                    title={t.description}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: t.preview.accent }}
                    />
                    <span className="hidden sm:inline">
                      {t.id === 'school-light' ? 'Terang' : t.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center bg-surface-container p-1 rounded-lg border border-outline-variant/20">
              <span className="px-2 text-on-tertiary-container font-metric-label text-[10px]">
                SIZE
              </span>
              {[24, 32, 40].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, fontSize: size })}
                  className={`px-2.5 py-0.5 font-metric-label text-xs rounded transition-all cursor-pointer ${
                    settings.fontSize === size
                      ? 'text-primary-fixed bg-surface-variant font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {size === 24 ? 'S' : size === 32 ? 'M' : 'L'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                onSettingsChange({ ...settings, showKeyboard: !settings.showKeyboard })
              }
              className={`px-3 py-1.5 font-metric-label text-xs rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                settings.showKeyboard
                  ? 'bg-primary-fixed/15 text-primary-fixed border-primary-fixed/50 font-bold'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-primary'
              }`}
              title="Tampilkan Papan Ketik Virtual & Panduan 10 Jari"
            >
              <span className="material-symbols-outlined text-[15px]">keyboard_alt</span>
              10 Jari
            </button>
          </div>
        </div>
      </div>

      {/* Live Metrics & Action Controls */}
      <div className="flex flex-wrap justify-between items-end mb-5 gap-4 w-full">
        <div className="flex items-center gap-6 sm:gap-10">
          <div className="flex flex-col">
            <span className="font-metric-label text-xs text-on-tertiary-container tracking-widest">
              WPM
            </span>
            <span className="font-metric-value text-metric-value text-primary tabular-nums">
              {currentWpm}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-metric-label text-xs text-on-tertiary-container tracking-widest">
              RAW
            </span>
            <span className="font-metric-value text-metric-value text-on-surface-variant tabular-nums">
              {currentRaw}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-metric-label text-xs text-on-tertiary-container tracking-widest">
              ACCURACY
            </span>
            <span className="font-metric-value text-metric-value text-primary tabular-nums">
              {currentAcc}
              <span className="text-secondary text-lg">%</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-metric-label text-xs text-on-tertiary-container tracking-widest">
              {mode === 'time' ? 'TIME' : 'PROGRESS'}
            </span>
            <span className="font-metric-value text-metric-value text-primary-fixed tabular-nums">
              {mode === 'time'
                ? `${timeLeft}s`
                : `${currentWordIndex}/${words.length}`}
            </span>
          </div>
        </div>

        {/* Session Actions & Personal Best */}
        <div className="flex items-center gap-3">
          {personalBest > 0 && (
            <div className="text-xs font-metric-label text-on-surface-variant mr-2">
              Rekor Terbaik: <strong className="text-primary-fixed tabular-nums">{personalBest} WPM</strong>
            </div>
          )}

          {(isRunning || isPaused) && (
            <button
              type="button"
              onClick={onTogglePause}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant border border-outline-variant/30 text-on-surface font-metric-label text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPaused ? 'play_arrow' : 'pause'}
              </span>
              {isPaused ? 'Lanjut' : 'Jeda'}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onRestart();
              focusStage();
            }}
            className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant border border-outline-variant/30 text-primary-fixed font-metric-label text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Mulai Ulang (Tab)"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Restart
          </button>
        </div>
      </div>

      {/* Caps Lock Warning */}
      {capsLockActive && (
        <div className="w-full mb-4 bg-error-container/20 text-error border border-error/50 rounded-lg py-2 px-4 flex items-center justify-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span className="font-metric-label font-bold tracking-wide">
            CAPS LOCK AKTIF — Matikan jika tidak sedang mengetik huruf kapital
          </span>
        </div>
      )}

      {/* The Stage: Typing Area */}
      <div
        onClick={focusStage}
        className={`relative bg-surface-container px-8 py-10 sm:p-12 rounded-xl border transition-all cursor-text ${
          isFocused && !isPaused
            ? 'border-primary-fixed/40 shadow-[0_0_25px_rgba(195,244,0,0.06)]'
            : 'border-outline-variant/20'
        }`}
      >
        {/* Hidden input for mobile virtual keyboards & desktop focus */}
        <input
          ref={mobileInputRef}
          type="text"
          value=""
          onChange={(e) => {
            if (onMobileInput && e.target.value) {
              onMobileInput(e.target.value);
            }
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="Area Mengetik"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="sr-only"
        />

        <div
          ref={containerRef}
          id="typing-canvas"
          className="font-display-typing text-left select-none outline-none overflow-hidden relative"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: 1.55,
            height: `${Math.round(settings.fontSize * 1.55 * dynamicLineCount)}px`,
          }}
        >
          <div
            ref={wordsScrollRef}
            className="h-full overflow-hidden pr-2"
          >
            {words.map((word, wordIdx) => {
              const typedWord = typedChars[wordIdx] || '';
              const isCurrentWord = wordIdx === currentWordIndex;
              const isPastWord = wordIdx < currentWordIndex;
              const hasWordMistake = isPastWord && typedWord !== word;

              return (
                <span
                  key={wordIdx}
                  ref={isCurrentWord ? activeWordRef : null}
                  className={`relative inline-block mr-[0.6em] mb-1.5 rounded px-0.5 ${
                    hasWordMistake ? 'decoration-error/80 underline underline-offset-4' : ''
                  }`}
                >
                  {word.split('').map((char, charIdx) => {
                    let charClass = 'typing-word-untyped';
                    if (isPastWord) {
                      if (charIdx < typedWord.length) {
                        charClass =
                          typedWord[charIdx] === char
                            ? 'typing-word-correct'
                            : 'typing-word-incorrect';
                      } else {
                        charClass = 'typing-word-incorrect opacity-60';
                      }
                    } else if (isCurrentWord) {
                      if (charIdx < currentCharIndex) {
                        charClass =
                          typedWord[charIdx] === char
                            ? 'typing-word-correct'
                            : 'typing-word-incorrect';
                      }
                    }

                    const showCaretBeforeChar =
                      isCurrentWord && charIdx === currentCharIndex;

                    return (
                      <span key={charIdx} className={`relative ${charClass}`}>
                        {showCaretBeforeChar && renderCaret()}
                        {char}
                      </span>
                    );
                  })}

                  {/* Extra typed characters beyond word.length */}
                  {typedWord.length > word.length &&
                    typedWord
                      .slice(word.length)
                      .split('')
                      .map((extraChar, extraIdx) => {
                        const actualIdx = word.length + extraIdx;
                        const showCaretBeforeExtra =
                          isCurrentWord && actualIdx === currentCharIndex;
                        return (
                          <span
                            key={`extra-${extraIdx}`}
                            className="relative typing-word-incorrect opacity-80"
                          >
                            {showCaretBeforeExtra && renderCaret()}
                            {extraChar}
                          </span>
                        );
                      })}

                  {/* Caret at the very end of the active word */}
                  {isCurrentWord &&
                    currentCharIndex >= Math.max(word.length, typedWord.length) && (
                      <span className="relative inline-block w-0 h-[1em] align-baseline">
                        {renderCaret()}
                      </span>
                    )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Overlay when Paused */}
        {isPaused && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onTogglePause();
            }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container/90 backdrop-blur-md rounded-xl cursor-pointer z-20 animate-fade-in"
          >
            <span className="material-symbols-outlined text-4xl text-primary-fixed mb-2">
              pause_circle
            </span>
            <p className="font-headline-md text-lg text-primary mb-1">Sesi Latihan Dijeda</p>
            <p className="font-body-sm text-on-surface-variant">
              Klik di sini atau tekan <kbd className="px-2 py-0.5 bg-surface-variant rounded text-xs font-metric-label text-primary-fixed">ESC</kbd> untuk melanjutkan
            </p>
          </div>
        )}

        {/* Overlay when Unfocused (only if not paused and modal closed) */}
        {!isFocused && !isPaused && !isAnyModalOpen && (
          <div
            onClick={focusStage}
            className="absolute inset-0 flex items-center justify-center bg-surface-container/80 backdrop-blur-[2px] rounded-xl cursor-pointer z-10 transition-opacity"
          >
            <div className="flex items-center gap-2 font-body-sm text-on-surface bg-surface-container-high border border-outline-variant/40 px-5 py-2.5 rounded-lg shadow-lg">
              <span className="material-symbols-outlined text-primary-fixed text-[18px]">
                ads_click
              </span>
              <span>Klik di sini atau mulai mengetik untuk fokus</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Virtual Keyboard & 10-Finger Guide */}
      {settings.showKeyboard && (
        <VirtualKeyboard
          targetChar={targetChar}
          lastPressedKey={lastPressedKey}
          missedKeys={missedKeys}
        />
      )}

      {/* Bottom Keyboard Shortcuts Hint */}
      <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-on-surface-variant/70 font-body-sm text-xs">
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 font-metric-label">
            TAB
          </kbd>
          <span>mulai ulang</span>
        </div>
        <span className="opacity-30">·</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 font-metric-label">
            ESC
          </kbd>
          <span>jeda / lanjut</span>
        </div>
        <span className="opacity-30">·</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 font-metric-label">
            CTRL + BACKSPACE
          </kbd>
          <span>hapus 1 kata</span>
        </div>
        {mode !== 'time' && isRunning && (
          <>
            <span className="opacity-30">·</span>
            <span className="font-metric-label text-primary-fixed tabular-nums">
              Waktu berjalan: {elapsedTime}s
            </span>
          </>
        )}
      </div>

      {/* Crawlable On-Page SEO Section for Search Engine Ranking */}
      <section
        aria-label="Informasi Latihan Mengetik MAKN Ende"
        className="mt-12 pt-8 border-t border-outline-variant/20 text-on-surface-variant"
      >
        <details className="group bg-surface-container-low border border-outline-variant/20 rounded-xl p-5">
          <summary className="flex items-center justify-between cursor-pointer list-none font-headline-md text-sm sm:text-base text-primary">
            <span>
              Panduan Latihan Mengetik MAKN Ende & Belajar Mengetik Cepat 10 Jari
            </span>
            <span className="material-symbols-outlined text-primary-fixed transition-transform group-open:rotate-180">
              expand_more
            </span>
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm leading-relaxed font-body-sm">
            <div>
              <h2 className="font-semibold text-primary mb-1.5">
                Tentang Latihan Mengetik MAKN Ende (ReyType)
              </h2>
              <p>
                <strong>ReyType – Latihan Mengetik MAKN Ende</strong> adalah aplikasi web latihan
                mengetik cepat dan tes kecepatan ketik (WPM) yang dirancang khusus untuk membantu
                siswa Madrasah Aliyah Kejuruan Negeri (MAKN) Ende, pelajar sekolah, anak-anak,
                maupun masyarakat umum dalam menguasai teknik mengetik 10 jari tanpa melihat
                papan ketik.
              </p>
            </div>
            <div>
              <h2 className="font-semibold text-primary mb-1.5">
                Tips Latihan Mengetik Cepat & Akurat
              </h2>
              <p>
                Untuk meningkatkan skor <strong>latihan mengetik</strong>, posisikan jari telunjuk
                kiri pada tombol <strong>F</strong> dan jari telunjuk kanan pada tombol{' '}
                <strong>J</strong> (<em>Home Row</em>). Utamakan akurasi ketukan di atas 95%
                menggunakan fitur <em>Papan Ketik Virtual 10 Jari</em> sebelum meningkatkan
                kecepatan WPM Anda.
              </p>
            </div>
          </div>
        </details>
      </section>

      {/* Custom Time Modal */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            className="bg-surface-container p-6 rounded-xl border border-outline-variant/40 w-full max-w-sm animate-scale-in-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-headline-md text-on-surface mb-4">
              Atur Durasi Custom
            </h3>
            <form onSubmit={handleCustomTimeSubmit}>
              <div className="flex gap-3 mb-6">
                <input
                  type="number"
                  min="5"
                  max="3600"
                  value={customTimeValue}
                  onChange={(e) => setCustomTimeValue(e.target.value)}
                  placeholder="Durasi"
                  className="w-full min-w-0 bg-surface-container-highest border border-outline-variant/40 rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary-fixed tabular-nums"
                  autoFocus
                  required
                />
                <select
                  value={customTimeUnit}
                  onChange={(e) => setCustomTimeUnit(e.target.value)}
                  className="bg-surface-container-highest border border-outline-variant/40 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary-fixed cursor-pointer"
                >
                  <option value="seconds">Detik</option>
                  <option value="minutes">Menit</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant font-metric-label text-xs hover:bg-surface-variant transition-colors cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-metric-label text-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  TERAPKAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Quote Creator & Manager Modal */}
      {showCustomQuoteModal && (() => {
        const draftWordList = quoteTextInput
          .trim()
          .replace(/\s+/g, ' ')
          .split(' ')
          .filter(Boolean);
        const draftWordCount = draftWordList.length;
        const draftCharCount = quoteTextInput.trim().length;

        const handleQuoteFormSubmit = (e) => {
          e.preventDefault();
          if (draftWordCount < 2 || draftCharCount < 5) {
            setQuoteFormError('Masukkan minimal 2 kata agar bisa dilatih dengan baik.');
            return;
          }
          if (onSaveCustomQuote) {
            onSaveCustomQuote({
              id: editingQuoteId,
              title: quoteTitleInput,
              text: quoteTextInput,
            });
          }
          setQuoteFormError('');
          setEditingQuoteId(null);
          setQuoteTitleInput('');
          setQuoteTextInput('');
          setShowCustomQuoteModal(false);
        };

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setShowCustomQuoteModal(false)}
          >
            <div
              className="bg-surface-container p-6 rounded-xl border border-outline-variant/40 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20">
                <div>
                  <h3 className="text-xl font-headline-md text-primary">
                    {editingQuoteId ? 'Ubah Kutipan Sendiri' : 'Buat Kutipan Sendiri'}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Tulis atau tempel kalimat, materi pelajaran, maupun kutipan favoritmu untuk
                    dilatih mengetik
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomQuoteModal(false)}
                  className="text-on-surface-variant hover:text-primary cursor-pointer"
                  aria-label="Tutup modal kutipan"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleQuoteFormSubmit} className="space-y-4">
                <div>
                  <label className="block font-metric-label text-xs text-on-tertiary-container mb-1.5">
                    JUDUL KUTIPAN (OPSIONAL)
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={quoteTitleInput}
                    onChange={(e) => setQuoteTitleInput(e.target.value)}
                    placeholder="Contoh: Motto MAKN Ende atau Ringkasan Materi"
                    className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed font-body-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-metric-label text-xs text-on-tertiary-container">
                      TEKS KUTIPAN
                    </label>
                    <span className="font-metric-label text-[11px] text-on-surface-variant tabular-nums">
                      {draftWordCount} kata · {draftCharCount} karakter
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={quoteTextInput}
                    onChange={(e) => {
                      setQuoteTextInput(e.target.value);
                      if (quoteFormError) setQuoteFormError('');
                    }}
                    placeholder="Ketik atau tempel teks kutipanmu di sini..."
                    className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-fixed font-display-typing text-sm leading-relaxed resize-y"
                    autoFocus
                    required
                  />
                  {quoteFormError && (
                    <p className="text-xs text-error mt-1.5 font-body-sm">{quoteFormError}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  {editingQuoteId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuoteId(null);
                        setQuoteTitleInput('');
                        setQuoteTextInput('');
                        setQuoteFormError('');
                      }}
                      className="mr-auto px-3 py-2 rounded-lg text-on-surface-variant font-metric-label text-xs hover:bg-surface-variant transition-colors cursor-pointer"
                    >
                      + BUAT BARU
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCustomQuoteModal(false)}
                    className="px-4 py-2 rounded-lg text-on-surface-variant font-metric-label text-xs hover:bg-surface-variant transition-colors cursor-pointer"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-metric-label text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
                  >
                    {editingQuoteId ? 'SIMPAN PERUBAHAN' : 'SIMPAN & LATIH SEKARANG'}
                  </button>
                </div>
              </form>

              {/* Saved Custom Quotes List */}
              {customQuotes.length > 0 && (
                <div className="mt-6 pt-5 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-metric-label text-xs text-on-tertiary-container tracking-wider">
                      KUTIPAN TERSIMPAN ({customQuotes.length})
                    </h4>
                  </div>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {customQuotes.map((q) => {
                      const isCurrent =
                        settings.quoteSource === 'custom' &&
                        (settings.activeCustomQuoteId === q.id ||
                          (!settings.activeCustomQuoteId && customQuotes[0]?.id === q.id));
                      const qWordCount = q.text.trim().split(/\s+/).filter(Boolean).length;

                      return (
                        <div
                          key={q.id}
                          className={`p-3 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-primary-fixed/10 border-primary-fixed/40'
                              : 'bg-surface-container-low border-outline-variant/25'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-body-sm text-sm font-semibold text-primary truncate">
                                {q.title}
                              </span>
                              <span className="text-xs text-on-surface-variant tabular-nums shrink-0">
                                · {qWordCount} kata
                              </span>
                            </div>
                            <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                              {q.text}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectCustomQuote) onSelectCustomQuote(q.id);
                                setShowCustomQuoteModal(false);
                              }}
                              className={`px-3 py-1.5 rounded-md font-metric-label text-xs transition-colors cursor-pointer whitespace-nowrap ${
                                isCurrent
                                  ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                                  : 'bg-surface-variant text-on-surface hover:text-primary-fixed'
                              }`}
                            >
                              {isCurrent ? 'Dipakai' : 'Pakai'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuoteId(q.id);
                                setQuoteTitleInput(q.title || '');
                                setQuoteTextInput(q.text || '');
                                setQuoteFormError('');
                              }}
                              className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-colors cursor-pointer"
                              title="Edit kutipan"
                            >
                              <span className="material-symbols-outlined text-[17px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onDeleteCustomQuote) onDeleteCustomQuote(q.id);
                                if (editingQuoteId === q.id) {
                                  setEditingQuoteId(null);
                                  setQuoteTitleInput('');
                                  setQuoteTextInput('');
                                }
                              }}
                              className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                              title="Hapus kutipan"
                            >
                              <span className="material-symbols-outlined text-[17px]">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
