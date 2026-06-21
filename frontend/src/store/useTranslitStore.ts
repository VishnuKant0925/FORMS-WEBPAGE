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
  { code: 'hi', label: 'Hindi',     native: 'हिन्दी',   script: 'Devanagari' },
  { code: 'mr', label: 'Marathi',   native: 'मराठी',    script: 'Devanagari' },
  { code: 'bn', label: 'Bengali',   native: 'বাংলা',    script: 'Bengali'    },
  { code: 'gu', label: 'Gujarati',  native: 'ગુજરાતી',  script: 'Gujarati'   },
  { code: 'ta', label: 'Tamil',     native: 'தமிழ்',    script: 'Tamil'      },
  { code: 'te', label: 'Telugu',    native: 'తెలుగు',   script: 'Telugu'     },
  { code: 'kn', label: 'Kannada',   native: 'ಕನ್ನಡ',    script: 'Kannada'    },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം',   script: 'Malayalam'  },
  { code: 'pa', label: 'Punjabi',   native: 'ਪੰਜਾਬੀ',   script: 'Gurmukhi'  },
  { code: 'or', label: 'Odia',      native: 'ଓଡ଼ିଆ',    script: 'Odia'       },
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
