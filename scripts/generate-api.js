const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://banglaquran.deenone.top';

const rootDir = path.join(__dirname, '..');
const libDataDir = path.join(rootDir, 'lib', 'data');
const publicApiDir = path.join(rootDir, 'public', 'api');

// Paths to data
const surasJsonPath = path.join(libDataDir, 'suras.json');
const ayahsDir = path.join(libDataDir, 'ayahs');
const tafsirsDir = path.join(libDataDir, 'tafsirs');

// Ensure output directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

console.log('🚀 Generating Bangla Quran All-in-One Static JSON API...');

ensureDir(publicApiDir);
ensureDir(path.join(publicApiDir, 'sura'));
ensureDir(path.join(publicApiDir, 'surah'));
ensureDir(path.join(publicApiDir, 'tafsir'));

// 1. Read Surah list
const rawSuras = JSON.parse(fs.readFileSync(surasJsonPath, 'utf8'));

// Build surahs list with BOTH Arabic and Bangla audio links
const surahsList = rawSuras.map((s) => {
  const paddedId = String(s.id).padStart(3, '0');
  const arabicAudioUrl = `${BASE_URL}/audio/arabic/${paddedId}001.mp3`;
  const banglaAudioUrl = `${BASE_URL}/audio/bt/${s.id}-1.mp3`;

  return {
    id: s.id,
    slug: s.slug,
    nameBn: s.nameBn,
    nameAr: s.nameAr || '',
    ayahCount: s.ayahCount,
    revelationPlace: s.revelationPlace || '',
    audio: {
      ar: arabicAudioUrl,
      bn: banglaAudioUrl
    },
    audioArabic: arabicAudioUrl,
    audioBangla: banglaAudioUrl,
    url: `${BASE_URL}/sura/${s.id}/${s.slug}`,
    apiUrl: `${BASE_URL}/api/sura/${s.id}.json`,
    tafsirApiUrl: `${BASE_URL}/api/tafsir/${s.id}.json`
  };
});

// Save /api/surahs.json & /api/suras.json
const surahsResponse = {
  success: true,
  total: surahsList.length,
  data: surahsList
};

fs.writeFileSync(
  path.join(publicApiDir, 'surahs.json'),
  JSON.stringify(surahsResponse, null, 2),
  'utf8'
);
fs.writeFileSync(
  path.join(publicApiDir, 'suras.json'),
  JSON.stringify(surahsResponse, null, 2),
  'utf8'
);
console.log('✅ Generated /api/surahs.json & /api/suras.json (Dual Audio: Arabic & Bangla for all 114 Surahs)');

// 2. Process each Surah with ALL-IN-ONE (Arabic text + Bangla text + Arabic audio + Bangla audio + Tafsir)
let processedSurahs = 0;
let processedTafsirs = 0;
const allSurahsComplete = [];

for (const sura of rawSuras) {
  const suraId = sura.id;
  const paddedId = String(suraId).padStart(3, '0');

  // Load Tafsir first so we can embed it into each Ayah for an All-in-One experience
  const tafsirFilePath = path.join(tafsirsDir, `${paddedId}.json`);
  let tafsirData = {};
  if (fs.existsSync(tafsirFilePath)) {
    tafsirData = JSON.parse(fs.readFileSync(tafsirFilePath, 'utf8'));
    processedTafsirs++;
  }

  // Load Ayahs
  const ayahFilePath = path.join(ayahsDir, `${paddedId}.json`);
  let ayahs = [];
  if (fs.existsSync(ayahFilePath)) {
    const rawAyahs = JSON.parse(fs.readFileSync(ayahFilePath, 'utf8'));
    ayahs = rawAyahs.map((a) => {
      // Resolve audio links to absolute URLs
      let arAudio = '';
      let bnAudio = '';

      if (a.audio) {
        if (typeof a.audio === 'string') {
          arAudio = a.audio.startsWith('http') ? a.audio : `${BASE_URL}${a.audio}`;
        } else {
          if (a.audio.ar) {
            arAudio = a.audio.ar.startsWith('http') ? a.audio.ar : `${BASE_URL}${a.audio.ar}`;
          }
          if (a.audio.bn) {
            bnAudio = a.audio.bn.startsWith('http') ? a.audio.bn : `${BASE_URL}${a.audio.bn}`;
          }
        }
      }

      // Fallbacks if ever empty
      if (!arAudio) {
        const paddedAyah = String(a.number).padStart(3, '0');
        arAudio = `${BASE_URL}/audio/arabic/${paddedId}${paddedAyah}.mp3`;
      }
      if (!bnAudio) {
        bnAudio = `${BASE_URL}/audio/bt/${suraId}-${a.number}.mp3`;
      }

      const ayahNumInt = parseInt(a.number, 10);
      const ayahTafsir = tafsirData[a.number] || tafsirData[String(ayahNumInt)] || '';

      return {
        number: a.number,
        ayahNumber: isNaN(ayahNumInt) ? 0 : ayahNumInt,
        arabic: a.arabic || a.arabic1 || '',
        bangla: a.bangla || '',
        audio: {
          ar: arAudio,
          bn: bnAudio
        },
        audioArabic: arAudio,
        audioBangla: bnAudio,
        tafsir: ayahTafsir
      };
    });
  }

  const suraArabicAudio = `${BASE_URL}/audio/arabic/${paddedId}001.mp3`;
  const suraBanglaAudio = `${BASE_URL}/audio/bt/${suraId}-1.mp3`;

  // ALL-IN-ONE Surah Payload
  const suraPayload = {
    success: true,
    id: sura.id,
    slug: sura.slug,
    nameBn: sura.nameBn,
    nameAr: sura.nameAr || '',
    ayahCount: sura.ayahCount,
    revelationPlace: sura.revelationPlace || '',
    audio: {
      ar: suraArabicAudio,
      bn: suraBanglaAudio
    },
    audioArabic: suraArabicAudio,
    audioBangla: suraBanglaAudio,
    totalAyahs: ayahs.length,
    ayahs
  };

  allSurahsComplete.push(suraPayload);

  const suraJsonContent = JSON.stringify(suraPayload);

  // Write /api/sura/1.json and /api/sura/001.json
  fs.writeFileSync(path.join(publicApiDir, 'sura', `${suraId}.json`), suraJsonContent, 'utf8');
  fs.writeFileSync(path.join(publicApiDir, 'sura', `${paddedId}.json`), suraJsonContent, 'utf8');

  // Also write aliases /api/surah/1.json and /api/surah/001.json
  fs.writeFileSync(path.join(publicApiDir, 'surah', `${suraId}.json`), suraJsonContent, 'utf8');
  fs.writeFileSync(path.join(publicApiDir, 'surah', `${paddedId}.json`), suraJsonContent, 'utf8');

  processedSurahs++;

  // Separate Tafsir endpoints (/api/tafsir/1.json & /api/tafsir/001.json)
  const tafsirPayload = {
    success: true,
    suraId: sura.id,
    suraSlug: sura.slug,
    suraNameBn: sura.nameBn,
    suraNameAr: sura.nameAr || '',
    tafsir: tafsirData
  };

  const tafsirJsonContent = JSON.stringify(tafsirPayload);
  fs.writeFileSync(path.join(publicApiDir, 'tafsir', `${suraId}.json`), tafsirJsonContent, 'utf8');
  fs.writeFileSync(path.join(publicApiDir, 'tafsir', `${paddedId}.json`), tafsirJsonContent, 'utf8');
}

console.log(`✅ Generated /api/sura/*.json & /api/surah/*.json (All-in-One: Arabic + Bangla + Dual Audio + Tafsir for ${processedSurahs} surahs)`);
console.log(`✅ Generated /api/tafsir/*.json (${processedTafsirs} tafsirs)`);

// 3. Generate Complete Quran All-in-One (/api/quran-all-in-one.json & /api/quran.json)
console.log('📦 Generating Complete Quran All-in-One JSON (/api/quran-all-in-one.json)...');
const quranAllPayload = {
  success: true,
  name: 'Al-Quran Al-Kareem Complete Dataset',
  totalSurahs: allSurahsComplete.length,
  surahs: allSurahsComplete
};
const quranAllString = JSON.stringify(quranAllPayload);
fs.writeFileSync(path.join(publicApiDir, 'quran-all-in-one.json'), quranAllString, 'utf8');
fs.writeFileSync(path.join(publicApiDir, 'quran.json'), quranAllString, 'utf8');
console.log('✅ Generated /api/quran-all-in-one.json & /api/quran.json (All 114 Surahs, All Ayahs, Dual Audio, Full Tafsir)');

// 4. Generate API Index & Documentation (/api/index.json)
const apiIndexPayload = {
  name: 'DeenOne Bangla Quran Official All-in-One API',
  version: '2.0.0',
  description: 'Ultra-fast, globally edge-cached static REST API for the Holy Quran with Arabic text, Bangla translation, Dual Audio streams (Arabic & Bangla BT), and Bangla Tafsir.',
  baseUrl: BASE_URL,
  audioTypes: {
    arabic: 'Mishary Rashid Alafasy / Arabic Recitation (/audio/arabic/...)',
    bangla: 'Bengali Translation Audio - BT (/audio/bt/...)'
  },
  endpoints: [
    {
      name: 'All Surahs List (Dual Audio)',
      method: 'GET',
      path: '/api/surahs.json',
      url: `${BASE_URL}/api/surahs.json`,
      description: 'Returns the complete list of 114 Surahs with metadata and both Arabic and Bangla audio links.'
    },
    {
      name: 'All-in-One Surah (Arabic, Bangla, Arabic Audio, Bangla Audio, Tafsir)',
      method: 'GET',
      path: '/api/sura/{id}.json',
      example: `${BASE_URL}/api/sura/1.json`,
      aliases: [
        `${BASE_URL}/api/sura/001.json`,
        `${BASE_URL}/api/surah/1.json`,
        `${BASE_URL}/api/surah/001.json`
      ],
      description: 'Returns all ayahs for the requested surah with Arabic text, Bengali translation, Arabic audio URL (audioArabic), Bangla audio URL (audioBangla), and embedded Bengali Tafsir for every ayah.'
    },
    {
      name: 'Complete Quran All-in-One (All 114 Surahs)',
      method: 'GET',
      path: '/api/quran-all-in-one.json',
      url: `${BASE_URL}/api/quran-all-in-one.json`,
      alias: `${BASE_URL}/api/quran.json`,
      description: 'The entire Holy Quran in a single JSON payload with all 114 surahs, ayahs, Arabic, Bangla, dual audio URLs, and tafsir.'
    },
    {
      name: 'Surah Bangla Tafsir Only',
      method: 'GET',
      path: '/api/tafsir/{id}.json',
      example: `${BASE_URL}/api/tafsir/1.json`,
      description: 'Returns Bengali Tafsir (Abu Bakr Zakaria) mapped by ayah number.'
    }
  ],
  cachePolicy: 'Edge CDN Cached (Cloudflare). Instant TTFB (<20ms).',
  cors: 'Access-Control-Allow-Origin: * enabled for all clients.'
};

fs.writeFileSync(
  path.join(publicApiDir, 'index.json'),
  JSON.stringify(apiIndexPayload, null, 2),
  'utf8'
);

// 5. Generate Cloudflare _headers file in public/
const headersContent = `
# Global API Headers for Cloudflare CDN
/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Access-Control-Allow-Headers: *
  Cache-Control: public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400
  Content-Type: application/json; charset=utf-8

# Audio caching
/audio/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=2592000, immutable
`;

fs.writeFileSync(path.join(rootDir, 'public', '_headers'), headersContent.trim() + '\n', 'utf8');
console.log('✅ Created public/_headers for Cloudflare Edge CORS & Caching');

console.log('🎉 All-in-One API Generation Completed Successfully!');
