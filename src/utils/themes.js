export const THEMES = [
  {
    id: 'cyber-lime',
    name: 'Cyber Lime',
    description: 'Tema gelap khas ReyType dengan aksen hijau neon tajam',
    isLight: false,
    preview: {
      bg: '#0b1326',
      surface: '#171f33',
      accent: '#c3f400',
      text: '#dae2fd',
    },
    chart: {
      primary: '#c3f400',
      secondary: '#00daf8',
      raw: '#8e9379',
      grid: '#2d3449',
      tick: '#8e9379',
      tooltipBg: '#131b2e',
      tooltipBorder: '#444933',
      tooltipText: '#dae2fd',
    },
  },
  {
    id: 'school-light',
    name: 'Kertas Sekolah (Mode Terang)',
    description: 'Kontras tinggi bersih, sangat jelas untuk proyektor kelas & siang hari',
    isLight: true,
    preview: {
      bg: '#f4f6f9',
      surface: '#ffffff',
      accent: '#1d4ed8',
      text: '#0f172a',
    },
    chart: {
      primary: '#1d4ed8',
      secondary: '#0891b2',
      raw: '#64748b',
      grid: '#e2e8f0',
      tick: '#475569',
      tooltipBg: '#ffffff',
      tooltipBorder: '#cbd5e1',
      tooltipText: '#0f172a',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Biru samudra tenang dengan aksen sian terang yang sejuk di mata',
    isLight: false,
    preview: {
      bg: '#071925',
      surface: '#0f2738',
      accent: '#38bdf8',
      text: '#e0f2fe',
    },
    chart: {
      primary: '#38bdf8',
      secondary: '#2dd4bf',
      raw: '#64748b',
      grid: '#1e3a52',
      tick: '#94a3b8',
      tooltipBg: '#0b2131',
      tooltipBorder: '#1e3a52',
      tooltipText: '#e0f2fe',
    },
  },
  {
    id: 'warm-sepia',
    name: 'Warm Sepia',
    description: 'Bernuansa hangat ramah mata untuk sesi latihan panjang',
    isLight: false,
    preview: {
      bg: '#1c1613',
      surface: '#28201b',
      accent: '#f59e0b',
      text: '#f5ebe1',
    },
    chart: {
      primary: '#f59e0b',
      secondary: '#34d399',
      raw: '#a89984',
      grid: '#3f322a',
      tick: '#a89984',
      tooltipBg: '#231c18',
      tooltipBorder: '#4d3d33',
      tooltipText: '#f5ebe1',
    },
  },
];

export function getThemeById(themeId) {
  return THEMES.find((t) => t.id === themeId) || THEMES[0];
}
