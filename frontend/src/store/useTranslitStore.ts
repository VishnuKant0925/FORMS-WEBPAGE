/**
 * useTranslitStore — Global transliteration language state.
 *
 * Always-ON: transliteration is NEVER disabled.
 * The store only tracks WHICH script to use (default: Hindi).
 *
 * Persisted to localStorage so the user's script choice
 * survives page reloads.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const TRANSLIT_LANGUAGES = [
  { code: 'as',  label: 'Assamese',   native: 'অসমীয়া',    script: 'Bengali'    },
  { code: 'bn',  label: 'Bengali',    native: 'বাংলা',      script: 'Bengali'    },
  { code: 'brx', label: 'Bodo',       native: 'बड़ो',       script: 'Devanagari' },
  { code: 'gu',  label: 'Gujarati',   native: 'ગુજરાતી',    script: 'Gujarati'   },
  { code: 'hi',  label: 'Hindi',      native: 'हिन्दी',     script: 'Devanagari' },
  { code: 'kn',  label: 'Kannada',    native: 'ಕನ್ನಡ',      script: 'Kannada'    },
  { code: 'ks',  label: 'Kashmiri',   native: 'कॉशुर',      script: 'Devanagari' },
  { code: 'gom', label: 'Konkani',    native: 'कोंकणी',     script: 'Devanagari' },
  { code: 'mai', label: 'Maithili',   native: 'मैथिली',     script: 'Devanagari' },
  { code: 'ml',  label: 'Malayalam',  native: 'മലയാളം',     script: 'Malayalam'  },
  { code: 'mni', label: 'Manipuri',   native: 'মৈতৈলোন্',    script: 'Bengali'    },
  { code: 'mr',  label: 'Marathi',    native: 'मराठी',      script: 'Devanagari' },
  { code: 'ne',  label: 'Nepali',     native: 'नेपाली',     script: 'Devanagari' },
  { code: 'or',  label: 'Odia',       native: 'ଓଡ଼ିଆ',      script: 'Odia'       },
  { code: 'pa',  label: 'Punjabi',    native: 'ਪੰਜਾਬੀ',     script: 'Gurmukhi'   },
  { code: 'sa',  label: 'Sanskrit',   native: 'संस्कृतम्',   script: 'Devanagari' },
  { code: 'sd',  label: 'Sindhi',     native: 'سنڌي',       script: 'Arabic'     },
  { code: 'si',  label: 'Sinhala',    native: 'සිංහල',      script: 'Sinhala'    },
  { code: 'ta',  label: 'Tamil',      native: 'தமிழ்',      script: 'Tamil'      },
  { code: 'te',  label: 'Telugu',     native: 'తెలుగు',     script: 'Telugu'     },
  { code: 'ur',  label: 'Urdu',       native: 'اردو',       script: 'Arabic'     },
] as const;


export type TranslitCode = typeof TRANSLIT_LANGUAGES[number]['code'];

interface TranslitState {
  /** Currently active script language code. Default: 'hi' */
  lang: TranslitCode;
  setLang: (lang: TranslitCode) => void;
}

export const useTranslitStore = create<TranslitState>()(
  persist(
    (set) => ({
      lang:    'hi',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'nrsc-translit-prefs',
    }
  )
);
