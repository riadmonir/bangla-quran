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

console.log('🚀 Generating Bangla Quran Static JSON API...');

ensureDir(publicApiDir);
ensureDir(path.join(publicApiDir, 'sura'));
ensureDir(path.join(publicApiDir, 'surah'));
ensureDir(path.join(publicApiDir, 'tafsir'));

// 1. Read Surah list
const rawSuras = JSON.parse(fs.readFileSync(surasJsonPath, 'utf8'));

const surahsList = rawSuras.map((s) => ({
  id: s.id,
  slug: s.slug,
  nameBn: s.nameBn,
  nameAr: s.nameAr || '',
  ayahCount: s.ayahCount,
  revelationPlace: s.revelationPlace || '',
  audioUrl: `${BASE_URL}/audio/arabic/${String(s.id).padStart(3, '0')}001.mp3`,
  url: `${BASE_URL}/sura/${s.id}/${s.slug}`,
  apiUrl: `${BASE_URL}/api/sura/${s.id}.json`,
  tafsirApiUrl: `${BASE_URL}/api/tafsir/${s.id}.json`
}));

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
console.log('✅ Generated /api/surahs.json & /api/suras.json (114 Surahs)');

// 2. Process each Surah
let processedSurahs = 0;
let processedTafsirs = 0;

for (const sura of rawSuras) {
  const suraId = sura.id;
  const paddedId = String(suraId).padStart(3, '0');

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

      return {
        number: a.number,
        ayahNumber: parseInt(a.number, 10),
        arabic: a.arabic || a.arabic1 || '',
        bangla: a.bangla || '',
        audio: {
          ar: arAudio,
          bn: bnAudio
        }
      };
    });
  }

  const suraPayload = {
    success: true,
    id: sura.id,
    slug: sura.slug,
    nameBn: sura.nameBn,
    nameAr: sura.nameAr || '',
    ayahCount: sura.ayahCount,
    revelationPlace: sura.revelationPlace || '',
    totalAyahs: ayahs.length,
    ayahs
  };

  const suraJsonContent = JSON.stringify(suraPayload);

  // Write both /api/sura/1.json and /api/sura/001.json
  fs.writeFileSync(path.join(publicApiDir, 'sura', `${suraId}.json`), suraJsonContent, 'utf8');
  fs.writeFileSync(path.join(publicApiDir, 'sura', `${paddedId}.json`), suraJsonContent, 'utf8');

  // Also write aliases /api/surah/1.json and /api/surah/001.json
  fs.writeFileSync(path.join(publicApiDir, 'surah', `${suraId}.json`), suraJsonContent, 'utf8');
  fs.writeFileSync(path.join(publicApiDir, 'surah', `${paddedId}.json`), suraJsonContent, 'utf8');

  processedSurahs++;

  // Load Tafsir
  const tafsirFilePath = path.join(tafsirsDir, `${paddedId}.json`);
  let tafsirData = {};
  if (fs.existsSync(tafsirFilePath)) {
    tafsirData = JSON.parse(fs.readFileSync(tafsirFilePath, 'utf8'));
    processedTafsirs++;
  }

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

console.log(`✅ Generated /api/sura/*.json & /api/surah/*.json (${processedSurahs} surahs)`);
console.log(`✅ Generated /api/tafsir/*.json (${processedTafsirs} tafsirs)`);

// 3. Generate API Index & Documentation (/api/index.json)
const apiIndexPayload = {
  name: 'DeenOne Bangla Quran Official API',
  version: '1.0.0',
  description: 'Ultra-fast, globally edge-cached static REST API for the Holy Quran with Arabic text, Bangla translation, audio streams, and Bangla Tafsir.',
  baseUrl: BASE_URL,
  endpoints: [
    {
      name: 'All Surahs List',
      method: 'GET',
      path: '/api/surahs.json',
      url: `${BASE_URL}/api/surahs.json`,
      description: 'Returns the complete list of 114 Surahs with metadata and audio links.'
    },
    {
      name: 'Surah Details & Ayahs',
      method: 'GET',
      path: '/api/sura/{id}.json',
      example: `${BASE_URL}/api/sura/1.json`,
      description: 'Returns all ayahs for the requested surah (1 to 114) with Arabic text, Bengali translation, and ayah audio URLs.'
    },
    {
      name: 'Surah Bangla Tafsir',
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

// 4. Generate Cloudflare _headers file in public/
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

console.log('🎉 API Generation Completed Successfully!');
