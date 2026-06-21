import { create } from 'zustand';

export type Lang = 'en' | 'hi';

// ─── Translation Dictionaries ─────────────────────────────
const translations = {
  en: {
    // Nav
    dashboard:    'Dashboard',
    newApp:       'New Application',
    history:      'My History',
    profile:      'Profile',
    admin:        'Admin Panel',
    settings:     'Settings',
    help:         'Help',
    logout:       'Logout',
    // Forms
    casualLeaveNrsc: 'NRSC Casual Leave',
    earnedLeave:     'Leave / Extension',
    casualLeaveRrsc: 'RRSC-W CL / Comp Off',
    traineeBiodata:  'Trainee Bio-Data',
    // Dashboard
    welcome:          'Welcome back',
    today:            'Today',
    totalApplications: 'Total Applications',
    approved:          'Approved',
    pending:           'Pending',
    rejected:          'Rejected',
    drafts:            'Drafts',
    quickActions:      'Quick Actions',
    recentSubmissions: 'Recent Submissions',
    viewAll:           'View all',
    noSubmissions:     'No submissions yet.',
    newApplication:    '+ New Application',
    // Table
    formType:  'Form Type',
    date:      'Date',
    status:    'Status',
    action:    'Action',
    view:      'View',
    download:  'Download',
    // Auth
    signIn:        'Sign In',
    signUp:        'Create Account',
    email:         'Email Address',
    password:      'Password',
    confirmPwd:    'Confirm Password',
    fullName:      'Full Name',
    forgotPwd:     'Forgot password?',
    noAccount:     "Don't have an account?",
    hasAccount:    'Already have an account?',
    registerHere:  'Register here',
    signInHere:    'Sign in',
    // Status
    draft:       'Draft',
    submitted:   'Submitted',
    recommended: 'Recommended',
    returnedStatus: 'Returned',
  },
  hi: {
    // Nav
    dashboard:    'डैशबोर्ड',
    newApp:       'नया आवेदन',
    history:      'मेरा इतिहास',
    profile:      'प्रोफ़ाइल',
    admin:        'प्रशासन',
    settings:     'सेटिंग्स',
    help:         'सहायता',
    logout:       'लॉग आउट',
    // Forms
    casualLeaveNrsc: 'NRSC आकस्मिक छुट्टी',
    earnedLeave:     'अर्जित छुट्टी',
    casualLeaveRrsc: 'RRSC-W आकस्मिक छुट्टी',
    traineeBiodata:  'प्रशिक्षणार्थी जीवन वृत्त',
    // Dashboard
    welcome:          'स्वागत है',
    today:            'आज',
    totalApplications: 'कुल आवेदन',
    approved:          'मंजूर',
    pending:           'लंबित',
    rejected:          'अस्वीकृत',
    drafts:            'मसौदे',
    quickActions:      'त्वरित क्रियाएँ',
    recentSubmissions: 'हालिया आवेदन',
    viewAll:           'सभी देखें',
    noSubmissions:     'अभी तक कोई आवेदन नहीं।',
    newApplication:    '+ नया आवेदन',
    // Table
    formType:  'फ़ॉर्म प्रकार',
    date:      'तारीख',
    status:    'स्थिति',
    action:    'कार्रवाई',
    view:      'देखें',
    download:  'डाउनलोड',
    // Auth
    signIn:        'साइन इन',
    signUp:        'खाता बनाएँ',
    email:         'ईमेल पता',
    password:      'पासवर्ड',
    confirmPwd:    'पासवर्ड पुनः दर्ज करें',
    fullName:      'पूरा नाम',
    forgotPwd:     'पासवर्ड भूल गए?',
    noAccount:     'खाता नहीं है?',
    hasAccount:    'पहले से खाता है?',
    registerHere:  'यहाँ पंजीकरण करें',
    signInHere:    'साइन इन करें',
    // Status
    draft:       'मसौदा',
    submitted:   'जमा किया',
    recommended: 'अनुशंसित',
    returnedStatus: 'वापस किया',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

export const useLangStore = create<LangState>((set, get) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
  t: (key) => {
    const { lang } = get();
    return (translations[lang] as Record<string, string>)[key] ?? (translations.en as Record<string, string>)[key] ?? key;
  },
}));
