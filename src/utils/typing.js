/**
 * Calculate Net Words Per Minute (WPM)
 * Standard: 1 word = 5 characters
 * @param {number} correctChars - Number of correctly typed characters
 * @param {number} timeInSeconds - Total time elapsed in seconds
 * @returns {number} WPM value
 */
export function calculateWPM(correctChars, timeInSeconds) {
  if (!timeInSeconds || timeInSeconds <= 0) return 0;
  const minutes = timeInSeconds / 60;
  const words = correctChars / 5;
  return Math.max(0, Math.round(words / minutes));
}

/**
 * Calculate Raw Words Per Minute (Raw WPM) including uncorrected/incorrect keystrokes
 * @param {number} totalChars - Total characters typed
 * @param {number} timeInSeconds - Total time elapsed in seconds
 * @returns {number} Raw WPM value
 */
export function calculateRawWPM(totalChars, timeInSeconds) {
  if (!timeInSeconds || timeInSeconds <= 0) return 0;
  const minutes = timeInSeconds / 60;
  const words = totalChars / 5;
  return Math.max(0, Math.round(words / minutes));
}

/**
 * Calculate typing accuracy
 * @param {number} correctChars - Number of correctly typed characters
 * @param {number} totalChars - Total characters typed
 * @returns {number} Accuracy percentage (0-100)
 */
export function calculateAccuracy(correctChars, totalChars) {
  if (!totalChars || totalChars <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((correctChars / totalChars) * 100)));
}

/**
 * Calculate typing consistency from per-second WPM samples
 * @param {Array<{wpm: number}>} chartData
 * @returns {number} Consistency percentage (0-100)
 */
export function calculateConsistency(chartData) {
  if (!chartData || chartData.length < 2) return 100;
  const values = chartData.map((d) => d.wpm).filter((v) => v > 0);
  if (values.length < 2) return 100;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 100;

  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / mean) * 100;
  return Math.max(10, Math.min(100, Math.round(100 - cv)));
}

/**
 * Get performance rating based on WPM
 * @param {number} wpm
 * @returns {{ label: string, sublabel: string, color: string, tier: string }}
 */
export function getPerformanceRating(wpm) {
  if (wpm >= 100) {
    return {
      label: 'Grandmaster',
      sublabel: 'Kecepatan luar biasa setara pengetik kompetitif',
      color: '#c3f400',
      tier: 'S+',
    };
  }
  if (wpm >= 80) {
    return {
      label: 'Expert',
      sublabel: 'Sangat cepat dan presisi tinggi',
      color: '#00daf8',
      tier: 'S',
    };
  }
  if (wpm >= 60) {
    return {
      label: 'Advanced',
      sublabel: 'Di atas rata-rata pengetik profesional',
      color: '#a5eeff',
      tier: 'A',
    };
  }
  if (wpm >= 40) {
    return {
      label: 'Proficient',
      sublabel: 'Kecepatan baik dan stabil untuk produktivitas',
      color: '#dae2fd',
      tier: 'B',
    };
  }
  if (wpm >= 25) {
    return {
      label: 'Developing',
      sublabel: 'Terus berlatih posisi jari 10 jari pada home row',
      color: '#c4c9ac',
      tier: 'C',
    };
  }
  return {
    label: 'Beginner',
    sublabel: 'Fokus pada akurasi ketukan sebelum meningkatkan kecepatan',
    color: '#8e9379',
    tier: 'D',
  };
}

// Shared AudioContext for zero-latency synthesized mechanical keyboard sounds
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play synthesized key sound without external audio files
 * @param {'key' | 'space' | 'error' | 'finish'} eventType
 * @param {'off' | 'mechanical' | 'tactile'} profile
 */
export function playKeySound(eventType, profile = 'off') {
  if (!profile || profile === 'off') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (eventType === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.06);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      osc.start(now);
      osc.stop(now + 0.07);
      return;
    }

    if (eventType === 'finish') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.33);
      return;
    }

    if (profile === 'mechanical') {
      osc.type = 'triangle';
      const baseFreq = eventType === 'space' ? 280 : 620;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.032);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.038);
    } else if (profile === 'tactile') {
      osc.type = 'sine';
      const baseFreq = eventType === 'space' ? 180 : 320;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);
      osc.start(now);
      osc.stop(now + 0.045);
    }
  } catch {
    // Ignore audio context errors when browser blocks autoplay
  }
}

/**
 * Finger mapping for 10-finger touch typing education
 */
const FINGER_MAP = {
  // Left Pinky
  '1': { id: 'l-pinky', label: 'Kelingking Kiri', color: '#ff8a80' },
  'q': { id: 'l-pinky', label: 'Kelingking Kiri', color: '#ff8a80' },
  'a': { id: 'l-pinky', label: 'Kelingking Kiri', color: '#ff8a80' },
  'z': { id: 'l-pinky', label: 'Kelingking Kiri', color: '#ff8a80' },
  // Left Ring
  '2': { id: 'l-ring', label: 'Jari Manis Kiri', color: '#ffd180' },
  'w': { id: 'l-ring', label: 'Jari Manis Kiri', color: '#ffd180' },
  's': { id: 'l-ring', label: 'Jari Manis Kiri', color: '#ffd180' },
  'x': { id: 'l-ring', label: 'Jari Manis Kiri', color: '#ffd180' },
  // Left Middle
  '3': { id: 'l-middle', label: 'Jari Tengah Kiri', color: '#c3f400' },
  'e': { id: 'l-middle', label: 'Jari Tengah Kiri', color: '#c3f400' },
  'd': { id: 'l-middle', label: 'Jari Tengah Kiri', color: '#c3f400' },
  'c': { id: 'l-middle', label: 'Jari Tengah Kiri', color: '#c3f400' },
  // Left Index
  '4': { id: 'l-index', label: 'Telunjuk Kiri', color: '#00daf8' },
  '5': { id: 'l-index', label: 'Telunjuk Kiri', color: '#00daf8' },
  'r': { id: 'l-index', label: 'Telunjuk Kiri', color: '#00daf8' },
  't': { id: 'l-index', label: 'Telunjuk Kiri', color: '#00daf8' },
  'f': { id: 'l-index', label: 'Telunjuk Kiri', color: '#00daf8' },
  'g': { id: 'l-index', label: 'Telunjuk Kiri', color: '#00daf8' },
  'v': { id: 'l-index', label: 'Telunjuk Kiri', color: '#00daf8' },
  'b': { id: 'l-index', label: 'Telunjuk Kiri', color: '#00daf8' },
  // Right Index
  '6': { id: 'r-index', label: 'Telunjuk Kanan', color: '#80d8ff' },
  '7': { id: 'r-index', label: 'Telunjuk Kanan', color: '#80d8ff' },
  'y': { id: 'r-index', label: 'Telunjuk Kanan', color: '#80d8ff' },
  'u': { id: 'r-index', label: 'Telunjuk Kanan', color: '#80d8ff' },
  'h': { id: 'r-index', label: 'Telunjuk Kanan', color: '#80d8ff' },
  'j': { id: 'r-index', label: 'Telunjuk Kanan', color: '#80d8ff' },
  'n': { id: 'r-index', label: 'Telunjuk Kanan', color: '#80d8ff' },
  'm': { id: 'r-index', label: 'Telunjuk Kanan', color: '#80d8ff' },
  // Right Middle
  '8': { id: 'r-middle', label: 'Jari Tengah Kanan', color: '#c3f400' },
  'i': { id: 'r-middle', label: 'Jari Tengah Kanan', color: '#c3f400' },
  'k': { id: 'r-middle', label: 'Jari Tengah Kanan', color: '#c3f400' },
  ',': { id: 'r-middle', label: 'Jari Tengah Kanan', color: '#c3f400' },
  // Right Ring
  '9': { id: 'r-ring', label: 'Jari Manis Kanan', color: '#ffd180' },
  'o': { id: 'r-ring', label: 'Jari Manis Kanan', color: '#ffd180' },
  'l': { id: 'r-ring', label: 'Jari Manis Kanan', color: '#ffd180' },
  '.': { id: 'r-ring', label: 'Jari Manis Kanan', color: '#ffd180' },
  // Right Pinky
  '0': { id: 'r-pinky', label: 'Kelingking Kanan', color: '#ff8a80' },
  'p': { id: 'r-pinky', label: 'Kelingking Kanan', color: '#ff8a80' },
  ';': { id: 'r-pinky', label: 'Kelingking Kanan', color: '#ff8a80' },
  '/': { id: 'r-pinky', label: 'Kelingking Kanan', color: '#ff8a80' },
  '-': { id: 'r-pinky', label: 'Kelingking Kanan', color: '#ff8a80' },
  // Thumb
  ' ': { id: 'thumb', label: 'Ibu Jari (Spasi)', color: '#d3e4fe' },
};

export function getFingerInfo(char) {
  if (!char) return null;
  const lower = char.toLowerCase();
  return FINGER_MAP[lower] || { id: 'r-pinky', label: 'Kelingking Kanan', color: '#ff8a80' };
}
