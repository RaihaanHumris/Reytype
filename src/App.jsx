import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Layout from './components/Layout';
import PracticeView from './views/PracticeView';
import LeaderboardView from './views/LeaderboardView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';
import ResultsView from './views/ResultsView';
import { generateWords } from './data/words';
import {
  calculateWPM,
  calculateRawWPM,
  calculateAccuracy,
  playKeySound,
} from './utils/typing';

const GAME_STATE = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished',
};

const DEFAULT_SETTINGS = {
  theme: 'cyber-lime', // 'cyber-lime' | 'school-light' | 'ocean-blue' | 'warm-sepia'
  mode: 'time', // 'time' | 'words' | 'quote'
  time: 30,
  wordCount: 25,
  isCustomTime: false,
  fontSize: 32,
  lineCount: 3,
  language: 'id', // 'id' | 'en'
  difficulty: 'standard', // 'standard' | 'kids' | 'code'
  includePunctuation: false,
  includeNumbers: false,
  sound: 'mechanical', // 'off' | 'mechanical' | 'tactile'
  caretStyle: 'line', // 'line' | 'block' | 'underline'
  showKeyboard: true,
};

const DEFAULT_PROFILE = {
  name: 'Pengetik',
  school: 'MAKN Ende',
  goalWpm: 60,
};

function buildSessionWords(cfg) {
  const count = cfg.mode === 'words' ? cfg.wordCount || 25 : 60;
  return generateWords(count, cfg.language, {
    difficulty: cfg.difficulty,
    includeNumbers: cfg.includeNumbers,
    includePunctuation: cfg.includePunctuation,
    mode: cfg.mode,
  });
}

function computeStatsSnapshot(words, currentWordIndex, typedChars, activeSeconds) {
  const safeSeconds = Math.max(1, activeSeconds);
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let totalTypedChars = 0;

  for (let i = 0; i <= currentWordIndex; i++) {
    const word = words[i];
    if (!word) continue;
    const typed = typedChars[i] || '';

    if (i < currentWordIndex) {
      for (let j = 0; j < Math.max(word.length, typed.length); j++) {
        totalTypedChars++;
        if (j < word.length && j < typed.length) {
          if (typed[j] === word[j]) {
            correctChars++;
          } else {
            incorrectChars++;
          }
        } else if (j >= word.length) {
          incorrectChars++;
          extraChars++;
        } else {
          incorrectChars++;
        }
      }
      if (typed.length > 0) {
        totalTypedChars++;
        if (typed === word) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      }
    } else {
      for (let j = 0; j < typed.length; j++) {
        totalTypedChars++;
        if (j < word.length) {
          if (typed[j] === word[j]) {
            correctChars++;
          } else {
            incorrectChars++;
          }
        } else {
          incorrectChars++;
          extraChars++;
        }
      }
    }
  }

  return {
    wpm: calculateWPM(correctChars, safeSeconds),
    rawWpm: calculateRawWPM(totalTypedChars, safeSeconds),
    accuracy: calculateAccuracy(correctChars, totalTypedChars),
    correctChars,
    incorrectChars,
    extraChars,
    wordsCompleted: currentWordIndex,
    totalChars: totalTypedChars,
    timeElapsed: safeSeconds,
  };
}

function App() {
  const [currentView, setCurrentView] = useState('practice');

  // Persisted Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('typerush_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  // Persisted Player Profile
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('typerush_profile');
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  });

  // Game State
  const [gameState, setGameState] = useState(GAME_STATE.IDLE);
  const [words, setWords] = useState(() => buildSessionWords(settings));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [typedChars, setTypedChars] = useState({});
  const [timeLeft, setTimeLeft] = useState(settings.time);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [lastPressedKey, setLastPressedKey] = useState('');
  const [missedKeys, setMissedKeys] = useState({});
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);

  const timerRef = useRef(null);
  const hasSavedResultRef = useRef(false);

  // Refs for interval access without triggering cascading effects
  const wordsRef = useRef(words);
  const wordIdxRef = useRef(currentWordIndex);
  const typedCharsRef = useRef(typedChars);
  const settingsRef = useRef(settings);
  const profileRef = useRef(profile);
  const elapsedRef = useRef(elapsedTime);

  useEffect(() => {
    wordsRef.current = words;
    wordIdxRef.current = currentWordIndex;
    typedCharsRef.current = typedChars;
    settingsRef.current = settings;
    profileRef.current = profile;
    elapsedRef.current = elapsedTime;
  });

  // Apply selected theme preset to document root & resolve canonical URL for SEO
  useEffect(() => {
    const activeTheme = settings.theme || 'cyber-lime';
    document.documentElement.setAttribute('data-theme', activeTheme);

    if (typeof window !== 'undefined') {
      const canonicalUrl = window.location.origin + window.location.pathname;
      let linkEl = document.querySelector('link[rel="canonical"]');
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.setAttribute('rel', 'canonical');
        document.head.appendChild(linkEl);
      }
      linkEl.setAttribute('href', canonicalUrl);

      let ogUrlEl = document.querySelector('meta[property="og:url"]');
      if (!ogUrlEl) {
        ogUrlEl = document.createElement('meta');
        ogUrlEl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrlEl);
      }
      ogUrlEl.setAttribute('content', canonicalUrl);
    }
  }, [settings.theme]);

  // Personal Best WPM from saved history
  const [personalBest, setPersonalBest] = useState(() => {
    try {
      const saved = localStorage.getItem('typerush_history');
      if (!saved) return 0;
      const history = JSON.parse(saved);
      if (!Array.isArray(history) || history.length === 0) return 0;
      return Math.max(...history.map((h) => h.wpm || 0));
    } catch {
      return 0;
    }
  });

  // Save profile updates
  const handleProfileChange = useCallback((newProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('typerush_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Finalize session & persist to localStorage
  const finalizeSession = useCallback(
    (finalWords, finalWordIndex, finalTypedChars, finalSeconds) => {
      if (hasSavedResultRef.current) return;
      hasSavedResultRef.current = true;

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const activeSettings = settingsRef.current;
      const activeProfile = profileRef.current;
      const finalStats = computeStatsSnapshot(
        finalWords,
        finalWordIndex,
        finalTypedChars,
        finalSeconds
      );

      playKeySound('finish', activeSettings.sound);

      setChartData((prev) => {
        const pt = finalStats.timeElapsed;
        const point = {
          time: pt,
          wpm: finalStats.wpm,
          rawWpm: finalStats.rawWpm,
          accuracy: finalStats.accuracy,
        };
        const idx = prev.findIndex((item) => item.time === pt);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = point;
          return copy;
        }
        return [...prev, point];
      });

      try {
        const saved = localStorage.getItem('typerush_history');
        const history = saved ? JSON.parse(saved) : [];
        const previousBest =
          history.length > 0 ? Math.max(...history.map((h) => h.wpm || 0)) : 0;
        if (finalStats.wpm > previousBest && finalStats.wpm > 0) {
          setIsNewPersonalBest(true);
          setPersonalBest(finalStats.wpm);
        } else if (previousBest > 0) {
          setPersonalBest(previousBest);
        }

        history.unshift({
          date: new Date().toISOString(),
          wpm: finalStats.wpm,
          rawWpm: finalStats.rawWpm,
          accuracy: finalStats.accuracy,
          timeElapsed: finalStats.timeElapsed,
          mode: activeSettings.mode || 'time',
          language: activeSettings.language || 'id',
          difficulty: activeSettings.difficulty || 'standard',
          playerName: activeProfile?.name || 'Pengetik',
          playerSchool: activeProfile?.school || 'MAKN Ende',
        });
        localStorage.setItem(
          'typerush_history',
          JSON.stringify(history.slice(0, 100))
        );
      } catch (e) {
        console.error(e);
      }

      setGameState(GAME_STATE.FINISHED);
    },
    []
  );

  // Restart session
  const handleRestart = useCallback(
    (overrideSettings) => {
      const activeCfg = overrideSettings || settings;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      hasSavedResultRef.current = false;
      setIsNewPersonalBest(false);
      setGameState(GAME_STATE.IDLE);
      setWords(buildSessionWords(activeCfg));
      setCurrentWordIndex(0);
      setCurrentCharIndex(0);
      setTypedChars({});
      setTimeLeft(activeCfg.time);
      setElapsedTime(0);
      setChartData([]);
      setLastPressedKey('');
      setMissedKeys({});
    },
    [settings]
  );

  // Settings change handler
  const handleSettingsChange = useCallback(
    (newSettings) => {
      setSettings(newSettings);
      try {
        localStorage.setItem('typerush_settings', JSON.stringify(newSettings));
      } catch (e) {
        console.error(e);
      }

      const needsWordRegen =
        newSettings.language !== settings.language ||
        newSettings.time !== settings.time ||
        newSettings.mode !== settings.mode ||
        newSettings.wordCount !== settings.wordCount ||
        newSettings.difficulty !== settings.difficulty ||
        newSettings.includePunctuation !== settings.includePunctuation ||
        newSettings.includeNumbers !== settings.includeNumbers;

      if (needsWordRegen) {
        handleRestart(newSettings);
      }
    },
    [settings, handleRestart]
  );

  const handleResetSettings = useCallback(() => {
    handleSettingsChange(DEFAULT_SETTINGS);
  }, [handleSettingsChange]);

  // Toggle Pause / Resume
  const handleTogglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === GAME_STATE.RUNNING) return GAME_STATE.PAUSED;
      if (prev === GAME_STATE.PAUSED) return GAME_STATE.RUNNING;
      return prev;
    });
  }, []);

  // Timer interval for RUNNING state
  useEffect(() => {
    if (gameState === GAME_STATE.RUNNING) {
      timerRef.current = setInterval(() => {
        const nextElapsed = elapsedRef.current + 1;
        elapsedRef.current = nextElapsed;
        setElapsedTime(nextElapsed);

        const snap = computeStatsSnapshot(
          wordsRef.current,
          wordIdxRef.current,
          typedCharsRef.current,
          nextElapsed
        );

        setChartData((prev) => [
          ...prev,
          {
            time: nextElapsed,
            wpm: snap.wpm,
            rawWpm: snap.rawWpm,
            accuracy: snap.accuracy,
          },
        ]);

        if ((settingsRef.current.mode || 'time') === 'time') {
          const remaining = settingsRef.current.time - nextElapsed;
          setTimeLeft(Math.max(0, remaining));
          if (remaining <= 0) {
            finalizeSession(
              wordsRef.current,
              wordIdxRef.current,
              typedCharsRef.current,
              settingsRef.current.time
            );
          }
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, finalizeSession]);

  // Calculate live and final stats
  const stats = useMemo(() => {
    if (gameState === GAME_STATE.IDLE) return null;

    const isTimeMode = (settings.mode || 'time') === 'time';
    const activeSeconds = isTimeMode
      ? Math.max(1, settings.time - timeLeft)
      : Math.max(1, elapsedTime);

    return computeStatsSnapshot(words, currentWordIndex, typedChars, activeSeconds);
  }, [
    gameState,
    words,
    currentWordIndex,
    typedChars,
    timeLeft,
    elapsedTime,
    settings.mode,
    settings.time,
  ]);

  // Process a single typed character
  const processCharacterInput = useCallback(
    (char) => {
      if (gameState === GAME_STATE.FINISHED || gameState === GAME_STATE.PAUSED) {
        return;
      }

      if (gameState === GAME_STATE.IDLE) {
        setGameState(GAME_STATE.RUNNING);
      }

      const targetWord = words[currentWordIndex] || '';
      setLastPressedKey(char);

      if (char === ' ') {
        if (currentCharIndex > 0) {
          playKeySound('space', settings.sound);
          const nextWordIndex = currentWordIndex + 1;
          const isFixedLengthMode =
            settings.mode === 'words' || settings.mode === 'quote';

          if (isFixedLengthMode && nextWordIndex >= words.length) {
            setCurrentWordIndex(nextWordIndex);
            finalizeSession(
              words,
              nextWordIndex,
              typedChars,
              Math.max(1, elapsedRef.current)
            );
          } else {
            setCurrentWordIndex(nextWordIndex);
            setCurrentCharIndex(0);
            // Dynamically append more words in 'time' mode if running low
            if (
              (settings.mode || 'time') === 'time' &&
              words.length - nextWordIndex < 25
            ) {
              setWords((prev) => [
                ...prev,
                ...generateWords(45, settings.language, {
                  difficulty: settings.difficulty,
                  includeNumbers: settings.includeNumbers,
                  includePunctuation: settings.includePunctuation,
                  mode: 'time',
                }),
              ]);
            }
          }
        }
        return;
      }

      // Limit extra characters per word to +8 to prevent layout overflow
      if (currentCharIndex >= targetWord.length + 8) {
        playKeySound('error', settings.sound);
        return;
      }

      const expectedChar = targetWord[currentCharIndex];
      const isCorrect = expectedChar === char;

      if (isCorrect) {
        playKeySound('key', settings.sound);
      } else {
        playKeySound('error', settings.sound);
        if (expectedChar) {
          const missedKey = expectedChar.toLowerCase();
          setMissedKeys((prev) => ({
            ...prev,
            [missedKey]: (prev[missedKey] || 0) + 1,
          }));
        }
      }

      const nextTypedWord = (typedChars[currentWordIndex] || '') + char;
      const nextCharIdx = currentCharIndex + 1;
      const updatedTypedMap = {
        ...typedChars,
        [currentWordIndex]: nextTypedWord,
      };

      setTypedChars(updatedTypedMap);
      setCurrentCharIndex(nextCharIdx);

      // In 'words' or 'quote' mode, if user finishes typing the very last character of the last word accurately, complete the test immediately!
      const isFixedLengthMode =
        settings.mode === 'words' || settings.mode === 'quote';
      if (
        isFixedLengthMode &&
        currentWordIndex === words.length - 1 &&
        nextTypedWord === targetWord
      ) {
        const finalWordIdx = currentWordIndex + 1;
        setCurrentWordIndex(finalWordIdx);
        finalizeSession(
          words,
          finalWordIdx,
          updatedTypedMap,
          Math.max(1, elapsedRef.current)
        );
      }
    },
    [
      gameState,
      words,
      currentWordIndex,
      currentCharIndex,
      typedChars,
      settings,
      finalizeSession,
    ]
  );

  // Handle keydown events from desktop keyboard
  const handleKeyDown = useCallback(
    (e) => {
      if (e.getModifierState) {
        setCapsLockActive(e.getModifierState('CapsLock'));
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (
          gameState === GAME_STATE.RUNNING ||
          gameState === GAME_STATE.PAUSED
        ) {
          handleTogglePause();
        } else {
          handleRestart();
        }
        return;
      }

      if (gameState === GAME_STATE.FINISHED || gameState === GAME_STATE.PAUSED) {
        return;
      }

      // Ignore browser shortcuts like Ctrl+C, Ctrl+V, Cmd+R (except Ctrl+Backspace)
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key !== 'Backspace') {
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        playKeySound('key', settings.sound);

        // Ctrl+Backspace deletes the whole current word
        if (e.ctrlKey || e.metaKey) {
          setCurrentCharIndex(0);
          setTypedChars((prev) => ({
            ...prev,
            [currentWordIndex]: '',
          }));
          return;
        }

        if (currentCharIndex > 0) {
          setCurrentCharIndex((prev) => prev - 1);
          setTypedChars((prev) => {
            const current = prev[currentWordIndex] || '';
            return {
              ...prev,
              [currentWordIndex]: current.slice(0, -1),
            };
          });
        } else if (currentWordIndex > 0) {
          // Allow backspacing to the previous word if the previous word wasn't typed accurately
          const prevIdx = currentWordIndex - 1;
          const prevTyped = typedChars[prevIdx] || '';
          const prevTarget = words[prevIdx] || '';
          if (prevTyped !== prevTarget) {
            setCurrentWordIndex(prevIdx);
            setCurrentCharIndex(prevTyped.length);
          }
        }
        return;
      }

      if (e.key === ' ' || e.key.length === 1) {
        e.preventDefault();
        processCharacterInput(e.key);
      }
    },
    [
      gameState,
      currentWordIndex,
      currentCharIndex,
      typedChars,
      words,
      settings.sound,
      handleTogglePause,
      handleRestart,
      processCharacterInput,
    ]
  );

  // Fallback handler for mobile virtual keyboards that fire input events instead of keydown char keys
  const handleMobileInput = useCallback(
    (val) => {
      if (!val) return;
      const lastChar = val.slice(-1);
      processCharacterInput(lastChar);
    },
    [processCharacterInput]
  );

  // Global Tab shortcut to restart
  useEffect(() => {
    const handleGlobalKey = (e) => {
      const activeTag = document.activeElement?.tagName;
      const isModalInput =
        (activeTag === 'INPUT' &&
          !document.activeElement?.classList.contains('sr-only')) ||
        activeTag === 'SELECT' ||
        activeTag === 'TEXTAREA';

      if (isModalInput) return;

      if (e.key === 'Tab' && currentView === 'practice') {
        e.preventDefault();
        handleRestart();
        const canvas = document.getElementById('typing-canvas');
        if (canvas) {
          canvas.classList.add('opacity-50');
          setTimeout(() => canvas.classList.remove('opacity-50'), 100);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleRestart, currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'leaderboard':
        return <LeaderboardView profile={profile} setView={setCurrentView} />;
      case 'history':
        return <HistoryView setView={setCurrentView} settings={settings} />;
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onResetSettings={handleResetSettings}
          />
        );
      case 'practice':
      default:
        if (gameState === GAME_STATE.FINISHED) {
          return (
            <ResultsView
              stats={stats}
              chartData={chartData}
              settings={settings}
              missedKeys={missedKeys}
              isNewPersonalBest={isNewPersonalBest}
              onRestart={() => handleRestart()}
              setView={setCurrentView}
            />
          );
        }
        return (
          <PracticeView
            words={words}
            currentWordIndex={currentWordIndex}
            currentCharIndex={currentCharIndex}
            typedChars={typedChars}
            timeLeft={timeLeft}
            totalTime={settings.time}
            elapsedTime={elapsedTime}
            isRunning={gameState === GAME_STATE.RUNNING}
            isPaused={gameState === GAME_STATE.PAUSED}
            stats={stats}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onKeyDown={handleKeyDown}
            onMobileInput={handleMobileInput}
            onRestart={() => handleRestart()}
            onTogglePause={handleTogglePause}
            capsLockActive={capsLockActive}
            lastPressedKey={lastPressedKey}
            missedKeys={missedKeys}
            personalBest={personalBest}
          />
        );
    }
  };

  return (
    <Layout
      currentView={currentView}
      setView={setCurrentView}
      settings={settings}
      onSettingsChange={handleSettingsChange}
      profile={profile}
      onProfileChange={handleProfileChange}
    >
      {renderView()}
    </Layout>
  );
}

export default App;
