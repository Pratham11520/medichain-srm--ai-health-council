// ==========================================
// India-Specific Health Tips Database
// 50+ curated tips organized by season & topic
// ==========================================

export interface HealthTip {
    id: number;
    tip: string;
    category: 'general' | 'monsoon' | 'summer' | 'winter' | 'diet' | 'mental' | 'exercise' | 'ayurvedic';
    emoji: string;
}

export const HEALTH_TIPS: HealthTip[] = [
    // General
    { id: 1, tip: "Drink at least 8 glasses (2L) of water daily. Add chia seeds or sabja for extra hydration.", emoji: "💧", category: "general" },
    { id: 2, tip: "Walk 10,000 steps daily — even a 30-min morning walk reduces diabetes risk by 40%.", emoji: "🚶", category: "general" },
    { id: 3, tip: "Sleep by 10 PM. Adults need 7-8 hours. Poor sleep raises cortisol and blood sugar.", emoji: "😴", category: "general" },
    { id: 4, tip: "Get your Vitamin D checked — 70%+ of Indians are deficient. 15 min morning sunlight helps.", emoji: "☀️", category: "general" },
    { id: 5, tip: "Always keep ORS (Electral) sachets at home — essential for dehydration from diarrhea or heat.", emoji: "🧂", category: "general" },
    { id: 6, tip: "Check your BP regularly. 1 in 4 Indians has hypertension and many don't know it.", emoji: "❤️", category: "general" },
    { id: 7, tip: "Never self-prescribe antibiotics. Antibiotic resistance is a serious crisis in India.", emoji: "💊", category: "general" },
    { id: 8, tip: "Wash hands with soap for 20 seconds before eating — prevents 80% of common infections.", emoji: "🧼", category: "general" },

    // Monsoon
    { id: 9, tip: "Monsoon: Boil drinking water or use water purifier. Waterborne diseases peak during rains.", emoji: "🌧️", category: "monsoon" },
    { id: 10, tip: "Monsoon: Apply mosquito repellent daily. Dengue and malaria cases surge during this season.", emoji: "🦟", category: "monsoon" },
    { id: 11, tip: "Monsoon: Avoid street food — contamination risk is highest. Eat freshly cooked home food.", emoji: "🍽️", category: "monsoon" },
    { id: 12, tip: "Monsoon: Keep feet dry. Fungal infections (athlete's foot) are common. Use antifungal powder.", emoji: "🦶", category: "monsoon" },
    { id: 13, tip: "Monsoon: Drink tulsi-ginger tea to boost immunity against seasonal flu and cold.", emoji: "🍵", category: "monsoon" },
    { id: 14, tip: "Monsoon: Check for stagnant water near your home — primary breeding ground for dengue mosquitoes.", emoji: "💦", category: "monsoon" },

    // Summer
    { id: 15, tip: "Summer: Drink aam panna or nimbu pani to prevent heat stroke. Avoid going out 12-3 PM.", emoji: "🥭", category: "summer" },
    { id: 16, tip: "Summer: Eat watermelon, cucumber, and curd to stay cool naturally.", emoji: "🍉", category: "summer" },
    { id: 17, tip: "Summer: Apply sunscreen SPF 30+ before going outdoors — skin cancer cases rising in India.", emoji: "🧴", category: "summer" },
    { id: 18, tip: "Summer: Carry ORS packets when travelling. Dehydration can cause kidney stones and UTIs.", emoji: "🏥", category: "summer" },
    { id: 19, tip: "Summer: Eat light meals — dal-chawal with buttermilk is perfect. Avoid heavy fried foods.", emoji: "🍚", category: "summer" },
    { id: 20, tip: "Summer: Wear cotton and light-colored clothes. Avoid synthetic fabrics that trap heat.", emoji: "👕", category: "summer" },

    // Winter
    { id: 21, tip: "Winter: Drink haldi milk (golden milk) before bed — anti-inflammatory and boosts immunity.", emoji: "🥛", category: "winter" },
    { id: 22, tip: "Winter: Don't skip exercise because of cold. Indoor yoga or surya namaskar works great.", emoji: "🧘", category: "winter" },
    { id: 23, tip: "Winter: Eat til (sesame) laddoos and gajak — they generate body heat naturally.", emoji: "🍬", category: "winter" },
    { id: 24, tip: "Winter: Heart attack risk increases in cold. Keep warm, avoid sudden exertion in cold.", emoji: "❄️", category: "winter" },
    { id: 25, tip: "Winter: Get flu vaccination. Influenza spreads fast in cold months.", emoji: "💉", category: "winter" },
    { id: 26, tip: "Winter: Apply mustard oil on dry skin — traditional Indian remedy that actually works.", emoji: "🫒", category: "winter" },

    // Diet
    { id: 27, tip: "Include dal (lentils) in every meal — cheapest and best source of protein for Indians.", emoji: "🥘", category: "diet" },
    { id: 28, tip: "Replace white sugar with jaggery (gur) — it's iron-rich and better for digestion.", emoji: "🍯", category: "diet" },
    { id: 29, tip: "Eat soaked almonds (5-6) every morning for brain health and memory.", emoji: "🥜", category: "diet" },
    { id: 30, tip: "Add methi (fenugreek) seeds to your diet — proven to reduce blood sugar levels.", emoji: "🌿", category: "diet" },
    { id: 31, tip: "Drink jeera (cumin) water first thing in the morning for better digestion and weight loss.", emoji: "🫗", category: "diet" },
    { id: 32, tip: "Eat seasonal fruits — papaya, guava, and amla are superfoods available cheaply in India.", emoji: "🍈", category: "diet" },
    { id: 33, tip: "Reduce maida (refined flour) — switch to atta roti, it has 3x more fiber.", emoji: "🫓", category: "diet" },
    { id: 34, tip: "Include curd (dahi) daily — it's a natural probiotic that improves gut health.", emoji: "🥛", category: "diet" },

    // Mental Health
    { id: 35, tip: "It's okay to not be okay. iCALL helpline: 9152987821 — free mental health support.", emoji: "🧠", category: "mental" },
    { id: 36, tip: "Practice 10 minutes of pranayama (breathing exercises) daily — reduces anxiety by 60%.", emoji: "🫁", category: "mental" },
    { id: 37, tip: "Limit screen time to 2 hours after work. Blue light disrupts sleep and increases anxiety.", emoji: "📱", category: "mental" },
    { id: 38, tip: "Talk to someone you trust about your feelings. Mental health stigma is reducing in India.", emoji: "💬", category: "mental" },
    { id: 39, tip: "Spend 20 min in nature daily — parks, gardens, or even your balcony with plants.", emoji: "🌳", category: "mental" },

    // Exercise
    { id: 40, tip: "Surya Namaskar (Sun Salutation) — just 12 rounds daily is a complete body workout.", emoji: "🧘", category: "exercise" },
    { id: 41, tip: "Take stairs instead of lift — burns 7x more calories than standing in an elevator.", emoji: "🏃", category: "exercise" },
    { id: 42, tip: "Do 2-minute stretching every hour if you have a desk job. Prevents back pain and stiffness.", emoji: "🤸", category: "exercise" },
    { id: 43, tip: "Morning yoga for 20 min is better than 1 hour of gym according to multiple Indian studies.", emoji: "🧘‍♀️", category: "exercise" },

    // Ayurvedic
    { id: 44, tip: "Chew a small piece of fresh ginger before meals — Ayurvedic remedy for better digestion.", emoji: "🫚", category: "ayurvedic" },
    { id: 45, tip: "Neem leaves tea or paste — traditional antibacterial, antifungal used for centuries.", emoji: "🌿", category: "ayurvedic" },
    { id: 46, tip: "Triphala churna before bed — ancient Ayurvedic remedy for constipation and gut health.", emoji: "🍃", category: "ayurvedic" },
    { id: 47, tip: "Tulsi (Holy Basil) leaves daily — boosts immunity, reduces stress, and fights infections.", emoji: "🪴", category: "ayurvedic" },
    { id: 48, tip: "Ashwagandha — Ayurvedic adaptogen proven by modern science to reduce stress hormones.", emoji: "💪", category: "ayurvedic" },
    { id: 49, tip: "Oil pulling with coconut/sesame oil — 15 min morning routine for oral health.", emoji: "🥥", category: "ayurvedic" },
    { id: 50, tip: "Amla (Indian Gooseberry) — richest source of Vitamin C, eat 1 daily for immunity.", emoji: "🟢", category: "ayurvedic" },
];

// Get a daily tip based on current date
export function getDailyTip(): HealthTip {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length];
}

// Get seasonal tips based on current month
export function getSeasonalTips(): HealthTip[] {
    const month = new Date().getMonth();
    if (month >= 6 && month <= 8) return HEALTH_TIPS.filter(t => t.category === 'monsoon');
    if (month >= 3 && month <= 5) return HEALTH_TIPS.filter(t => t.category === 'summer');
    if (month >= 10 || month <= 1) return HEALTH_TIPS.filter(t => t.category === 'winter');
    return HEALTH_TIPS.filter(t => t.category === 'general');
}

// Get random tips
export function getRandomTips(count: number = 3): HealthTip[] {
    const shuffled = [...HEALTH_TIPS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
