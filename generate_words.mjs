import fs from 'fs';
import https from 'https';
import path from 'path';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching English 10,000 words...');
  const enText = await fetchUrl('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt');
  const enWords = enText.split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 1 && w.length < 15);
  
  // Try a popular indonesian word list
  console.log('Fetching Indonesian words...');
  let idWords = [];
  try {
    const idText = await fetchUrl('https://raw.githubusercontent.com/sastrawi/sastrawi/master/data/kata-dasar.txt');
    idWords = idText.split('\n')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 2 && w.length < 15);
  } catch (e) {
    console.log('Failed to fetch from sastrawi, trying fallback...', e);
    // Fallback if that repo doesn't exist
    try {
      const idText = await fetchUrl('https://raw.githubusercontent.com/sastrawi/sastrawi/master/data/kata-dasar.txt');
      idWords = idText.split('\n')
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 2 && w.length < 15);
    } catch (e2) {}
  }

  // Shuffle arrays to mix up common/uncommon
  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  const finalEn = shuffle(enWords).slice(0, 10000);
  const finalId = shuffle(idWords).slice(0, 10000);

  console.log(`Grabbed ${finalEn.length} English words and ${finalId.length} Indonesian words.`);

  const fileContent = `// Auto-generated 10,000 words list
export const indonesianWords = ${JSON.stringify(finalId)};

export const englishWords = ${JSON.stringify(finalEn)};

// Helper function to get random words
export const generateWords = (count = 50, language = 'indonesia') => {
  const dictionary = language === 'english' ? englishWords : indonesianWords;
  if (!dictionary || dictionary.length === 0) return [];
  
  const selectedWords = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * dictionary.length);
    selectedWords.push(dictionary[randomIndex]);
  }
  return selectedWords;
};
`;

  const targetPath = path.resolve('./src/data/words.js');
  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log('Saved to src/data/words.js');
}

main().catch(console.error);
