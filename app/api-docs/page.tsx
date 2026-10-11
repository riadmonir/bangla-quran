import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ডেভেলপার API | বাংলা কুরআন',
  description: 'DeenOne বাংলা কুরআন অফিশিয়াল REST API ডকুমেন্টেশন। সম্পূর্ণ ১১৪টি সূরার আরবি, বাংলা অনুবাদ, ডুয়াল অডিও ও তাফসির।'
};

const endpoints = [
  {
    title: 'সম্পূর্ণ কুরআন All-in-One JSON',
    method: 'GET',
    url: 'https://banglaquran.deenone.top/api/quran.json',
    desc: '১১৪টি সূরার সকল আয়াত, আরবি টেক্সট, বাংলা অনুবাদ, আরবি ও বাংলা (BT) অডিও লিঙ্ক এবং পূর্ণাঙ্গ তাফসির একসাথে।'
  },
  {
    title: 'সকল সূরার তালিকা ও মেটাডাটা (Dual Audio)',
    method: 'GET',
    url: 'https://banglaquran.deenone.top/api/surahs.json',
    desc: '১১৪টি সূরার আইডি, নাম, আয়াত সংখ্যা, স্থান এবং প্রতিটি সূরার অ্যারাবিক ও বাংলা অডিও স্ট্রিম লিঙ্ক।'
  },
  {
    title: 'সূরা ১ (আল-ফাতিহা) All-in-One',
    method: 'GET',
    url: 'https://banglaquran.deenone.top/api/sura/1.json',
    desc: 'সূরা আল-ফাতিহার সকল আয়াত, আরবি, বাংলা অনুবাদ, অ্যারাবিক অডিও, বাংলা অডিও এবং প্রতিটি আয়াতের তাফসির।'
  },
  {
    title: 'সূরা ২ (আল-বাকারা) All-in-One',
    method: 'GET',
    url: 'https://banglaquran.deenone.top/api/sura/2.json',
    desc: 'সূরা আল-বাকারার ২৮৬টি আয়াত, আরবি, বাংলা অনুবাদ, ডুয়াল অডিও এবং প্রতিটি আয়াতের তাফসির।'
  },
  {
    title: 'সূরা ১ তাফসির (আবু বকর যাকারিয়া)',
    method: 'GET',
    url: 'https://banglaquran.deenone.top/api/tafsir/1.json',
    desc: 'শুধুমাত্র সূরা আল-ফাতিহার আয়াতভিত্তিক পূর্ণাঙ্গ বাংলা তাফসির।'
  },
  {
    title: 'অ্যারাবিক অডিও স্ট্রিম (নমুনা)',
    method: 'GET',
    url: 'https://banglaquran.deenone.top/audio/arabic/001001.mp3',
    desc: 'সূরা ১, আয়াত ১-এর বিশুদ্ধ আরবি তেলাওয়াত MP3 ফাইল।'
  },
  {
    title: 'বাংলা অনুবাদ (BT) অডিও স্ট্রিম (নমুনা)',
    method: 'GET',
    url: 'https://banglaquran.deenone.top/audio/bt/1-1.mp3',
    desc: 'সূরা ১, আয়াত ১-এর বাংলা অনুবাদ (BT) অডিও MP3 ফাইল।'
  }
];

export default function ApiDocsPage() {
  return (
    <div className="home-container">
      <SiteHeader />
      <main className="saved-main" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
            DeenOne বাংলা কুরআন অফিশিয়াল API
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 640, margin: '0 auto' }}>
            বিশ্বের দ্রুততম Cloudflare Edge CDN ভিত্তিক ফ্রি কুরআন REST API। কোনো রেট-লিমিট ছাড়া সরাসরি যেকোনো অ্যান্ড্রয়েড বা ওয়েব অ্যাপসে ব্যবহার করুন।
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '20px 24px',
                boxShadow: 'var(--shadow)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  {ep.title}
                </h2>
                <span
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  {ep.method}
                </span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: 12 }}>
                {ep.desc}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <code
                  style={{
                    backgroundColor: 'var(--bg)',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: '0.9rem',
                    color: 'var(--accent)',
                    wordBreak: 'break-all',
                    flex: 1
                  }}
                >
                  {ep.url}
                </code>
                <a
                  href={ep.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  ওপেন করুন ↗
                </a>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 40,
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '24px',
            color: 'var(--text)'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>
            অডিও প্লেয়ার ব্যবহারের নিয়ম:
          </h3>
          <ul style={{ paddingLeft: 20, color: 'var(--muted)', lineHeight: 1.8 }}>
            <li>
              <strong>আরবি অডিও:</strong> প্রতিটি আয়াতের <code style={{ color: 'var(--accent)' }}>audioArabic</code> ফিল্ডে সরাসরি MP3 লিঙ্ক পাওয়া যাবে।
            </li>
            <li>
              <strong>বাংলা অডিও (BT):</strong> প্রতিটি আয়াতের <code style={{ color: 'var(--accent)' }}>audioBangla</code> ফিল্ডে সরাসরি বাংলা অডিও MP3 লিঙ্ক রয়েছে।
            </li>
            <li>
              <strong>তাফসির:</strong> প্রতিটি আয়াতের <code style={{ color: 'var(--accent)' }}>tafsir</code> ফিল্ডে সম্পূর্ণ তাফসির রয়েছে।
            </li>
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
