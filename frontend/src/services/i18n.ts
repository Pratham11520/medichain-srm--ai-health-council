// ==========================================
// Hindi-English i18n Service
// Lightweight internationalization for
// MediChain SRM — India-first health app
// ==========================================

export type Language = 'en' | 'hi';

interface TranslationMap {
    [key: string]: { en: string; hi: string };
}

const translations: TranslationMap = {
    // Navigation
    'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
    'nav.chat': { en: 'MediBot Chat', hi: 'मेडीबॉट चैट' },
    'nav.symptoms': { en: 'Symptom Analyzer', hi: 'लक्षण विश्लेषक' },
    'nav.report': { en: 'Report Reader', hi: 'रिपोर्ट रीडर' },
    'nav.drugInteraction': { en: 'Drug Interactions', hi: 'दवा इंटरैक्शन' },
    'nav.ledger': { en: 'Hash Ledger', hi: 'हैश लेजर' },
    'nav.nearby': { en: 'Nearby Pharmacies', hi: 'नजदीकी फार्मेसी' },
    'nav.healthTracker': { en: 'Health Tracker', hi: 'स्वास्थ्य ट्रैकर' },
    'nav.pillReminder': { en: 'Pill Reminder', hi: 'दवा रिमाइंडर' },

    // Dashboard
    'dashboard.welcome': { en: 'Welcome back', hi: 'वापसी पर स्वागत' },
    'dashboard.healthTip': { en: 'Daily Health Tip', hi: 'दैनिक स्वास्थ्य टिप' },
    'dashboard.quickActions': { en: 'Quick Actions', hi: 'त्वरित कार्य' },
    'dashboard.stats': { en: 'System Statistics', hi: 'सिस्टम आँकड़े' },
    'dashboard.blockchain': { en: 'Blockchain Status', hi: 'ब्लॉकचेन स्थिति' },

    // Chat
    'chat.askAnything': { en: 'Ask MediBot Anything', hi: 'मेडीबॉट से कुछ भी पूछें' },
    'chat.typeQuestion': { en: 'Type your health question...', hi: 'अपना स्वास्थ्य प्रश्न लिखें...' },
    'chat.verifyMedicine': { en: 'Verify Medicine', hi: 'दवा सत्यापित करें' },
    'chat.consultations': { en: 'My Consultations', hi: 'मेरी परामर्श' },
    'chat.export': { en: 'Export', hi: 'निर्यात' },
    'chat.share': { en: 'Share', hi: 'शेयर करें' },
    'chat.newChat': { en: 'New Consultation', hi: 'नया परामर्श' },
    'chat.verified': { en: 'Verified from Indian Database', hi: 'भारतीय डेटाबेस से सत्यापित' },
    'chat.buyOn': { en: 'Buy on', hi: 'खरीदें' },
    'chat.saveGeneric': { en: 'Save with generic', hi: 'जेनेरिक से बचत' },

    // Health Tracker
    'health.tracker': { en: 'Health Tracker', hi: 'स्वास्थ्य ट्रैकर' },
    'health.addReading': { en: 'Add Reading', hi: 'रीडिंग जोड़ें' },
    'health.bloodPressure': { en: 'Blood Pressure', hi: 'ब्लड प्रेशर' },
    'health.bloodSugar': { en: 'Blood Sugar', hi: 'ब्लड शुगर' },
    'health.weight': { en: 'Weight', hi: 'वज़न' },
    'health.heartRate': { en: 'Heart Rate', hi: 'हृदय गति' },
    'health.temperature': { en: 'Temperature', hi: 'तापमान' },
    'health.normal': { en: 'Normal', hi: 'सामान्य' },
    'health.high': { en: 'High', hi: 'उच्च' },
    'health.low': { en: 'Low', hi: 'कम' },

    // Pill Reminder
    'pill.title': { en: 'Pill Reminder', hi: 'दवा रिमाइंडर' },
    'pill.addMedicine': { en: 'Add Medicine', hi: 'दवा जोड़ें' },
    'pill.markTaken': { en: 'Mark as Taken', hi: 'ली गई' },
    'pill.adherence': { en: 'Adherence', hi: 'पालन' },
    'pill.morning': { en: 'Morning', hi: 'सुबह' },
    'pill.afternoon': { en: 'Afternoon', hi: 'दोपहर' },
    'pill.evening': { en: 'Evening', hi: 'शाम' },
    'pill.night': { en: 'Night', hi: 'रात' },

    // Common
    'common.submit': { en: 'Submit', hi: 'जमा करें' },
    'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
    'common.save': { en: 'Save', hi: 'सहेजें' },
    'common.delete': { en: 'Delete', hi: 'हटाएं' },
    'common.loading': { en: 'Loading...', hi: 'लोड हो रहा...' },
    'common.error': { en: 'Error occurred', hi: 'त्रुटि हुई' },
    'common.signOut': { en: 'Sign Out', hi: 'साइन आउट' },
    'common.disclaimer': { en: 'AI-assisted guidance only. Consult a qualified doctor.', hi: 'केवल AI-सहायता मार्गदर्शन। योग्य डॉक्टर से सलाह लें।' },
};

// Current language state
let currentLanguage: Language = (localStorage.getItem('medichain_language') as Language) || 'en';

export function setLanguage(lang: Language): void {
    currentLanguage = lang;
    localStorage.setItem('medichain_language', lang);
    // Dispatch custom event for components to re-render
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
}

export function getLanguage(): Language {
    return currentLanguage;
}

export function t(key: string): string {
    const entry = translations[key];
    if (!entry) return key;
    return entry[currentLanguage] || entry.en || key;
}

// Get the system prompt language instruction for backend
export function getLanguagePromptSuffix(): string {
    if (currentLanguage === 'hi') {
        return '\n\nIMPORTANT: Respond in Hindi (हिन्दी). Use Devanagari script. Keep medicine names in English but explain everything else in Hindi.';
    }
    return '';
}
