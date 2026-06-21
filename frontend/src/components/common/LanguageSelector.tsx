'use client';

import { useLangStore } from '@/store/useLangStore';

export default function LanguageSelector() {
  const { lang, setLang } = useLangStore();

  return (
    <div className="lang-toggle" role="group" aria-label="Language selector">
      <button
        id="lang-en"
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        title="English"
      >
        EN
      </button>
      <button
        id="lang-hi"
        className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
        onClick={() => setLang('hi')}
        aria-pressed={lang === 'hi'}
        title="हिन्दी"
      >
        <span lang="hi">हि</span>
      </button>
    </div>
  );
}
