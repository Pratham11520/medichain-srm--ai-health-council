// Symptom Protocol Database — Maps symptoms to conditions, remedies, and severity

export interface SymptomProtocol {
    id: string;
    symptom: string;
    icon: string;
    conditions: {
        name: string;
        probability: 'High' | 'Medium' | 'Low';
        description: string;
    }[];
    homeRemedies: string[];
    warningSignals: string[];
    severity: 'Green' | 'Yellow' | 'Red';
    relatedMedicines: string[]; // brand names from indianMedicines.ts
}

export const SYMPTOM_PROTOCOLS: SymptomProtocol[] = [
    {
        id: "sp_001", symptom: "Headache", icon: "🤕",
        conditions: [
            { name: "Tension Headache", probability: "High", description: "Stress or muscle tension causing band-like pain" },
            { name: "Migraine", probability: "Medium", description: "Throbbing pain with nausea/light sensitivity" },
            { name: "Sinusitis", probability: "Medium", description: "Headache with nasal congestion and facial pressure" },
        ],
        homeRemedies: ["Apply cold compress on forehead", "Drink ginger tea", "Rest in a dark room", "Peppermint oil on temples", "Stay hydrated"],
        warningSignals: ["Sudden severe headache ('thunderclap')", "Headache with fever + stiff neck", "Vision changes", "Headache after head injury"],
        severity: "Green",
        relatedMedicines: ["Dolo 650", "Crocin Advance", "Combiflam"]
    },
    {
        id: "sp_002", symptom: "Fever", icon: "🌡️",
        conditions: [
            { name: "Viral Fever", probability: "High", description: "Common viral infection causing body temperature rise" },
            { name: "Dengue", probability: "Medium", description: "Mosquito-borne viral fever with body aches and rash" },
            { name: "Typhoid", probability: "Low", description: "Bacterial infection from contaminated food/water" },
        ],
        homeRemedies: ["Cold compress on forehead/armpits", "Drink plenty of fluids", "Tulsi (basil) tea with honey", "Light and easily digestible food", "Adequate rest"],
        warningSignals: ["Fever > 103°F / 39.5°C", "Fever lasting > 3 days", "Rash or bleeding spots", "Confusion or delirium", "Severe abdominal pain"],
        severity: "Yellow",
        relatedMedicines: ["Dolo 650", "Crocin Advance"]
    },
    {
        id: "sp_003", symptom: "Cold & Cough", icon: "🤧",
        conditions: [
            { name: "Common Cold", probability: "High", description: "Viral upper respiratory infection" },
            { name: "Allergic Rhinitis", probability: "Medium", description: "Allergic response causing sneezing and runny nose" },
            { name: "Bronchitis", probability: "Low", description: "Inflammation of bronchial tubes" },
        ],
        homeRemedies: ["Steam inhalation with eucalyptus", "Warm salt water gargle", "Honey + ginger + tulsi tea", "Haldi (turmeric) milk at night", "Stay warm and rest"],
        warningSignals: ["Cough lasting > 3 weeks", "Blood in sputum", "High fever with cough", "Difficulty breathing", "Chest pain while coughing"],
        severity: "Green",
        relatedMedicines: ["Sinarest", "Benadryl Cough Syrup", "Cetirizine (Cetzine)", "Montair LC"]
    },
    {
        id: "sp_004", symptom: "Stomach Pain", icon: "🤢",
        conditions: [
            { name: "Acidity/GERD", probability: "High", description: "Excess stomach acid causing burning pain" },
            { name: "Gastritis", probability: "Medium", description: "Inflammation of stomach lining" },
            { name: "Appendicitis", probability: "Low", description: "Inflammation of appendix — needs urgent care" },
        ],
        homeRemedies: ["Jeera (cumin) water", "Cold milk for acidity relief", "Ajwain (carom seeds) with warm water", "Avoid spicy and oily food", "Small frequent meals"],
        warningSignals: ["Severe pain in right lower abdomen", "Blood in stool or vomit", "Fever with abdominal pain", "Inability to pass stool/gas", "Yellowing of eyes"],
        severity: "Yellow",
        relatedMedicines: ["Pan-D", "Gelusil MPS", "Rantac 150", "Meftal Spas"]
    },
    {
        id: "sp_005", symptom: "Back Pain", icon: "🦴",
        conditions: [
            { name: "Muscle Strain", probability: "High", description: "Overuse or injury to back muscles" },
            { name: "Lumbar Spondylosis", probability: "Medium", description: "Age-related wear of spinal discs" },
            { name: "Kidney Stones", probability: "Low", description: "Sharp pain radiating from back to groin" },
        ],
        homeRemedies: ["Hot compress on affected area", "Gentle stretching exercises", "Epsom salt bath", "Maintain proper posture", "Turmeric paste application"],
        warningSignals: ["Pain radiating to legs", "Numbness in legs", "Bladder control issues", "Pain after trauma", "Pain worsening at night"],
        severity: "Green",
        relatedMedicines: ["Voveran SR", "Combiflam", "Myospaz"]
    },
    {
        id: "sp_006", symptom: "Joint Pain", icon: "🦵",
        conditions: [
            { name: "Osteoarthritis", probability: "High", description: "Degenerative joint disease from wear and tear" },
            { name: "Rheumatoid Arthritis", probability: "Medium", description: "Autoimmune condition affecting joints" },
            { name: "Gout", probability: "Medium", description: "Uric acid crystal deposits in joints" },
        ],
        homeRemedies: ["Warm oil massage (sesame/mustard)", "Epsom salt warm bath", "Turmeric + black pepper milk", "Regular gentle exercise", "Maintain healthy weight"],
        warningSignals: ["Joint swelling with redness", "Sudden severe joint pain at night", "Joint deformity", "Fever with joint pain", "Inability to move the joint"],
        severity: "Yellow",
        relatedMedicines: ["Voveran SR", "Combiflam", "Shelcal 500"]
    },
    {
        id: "sp_007", symptom: "Diarrhea", icon: "💧",
        conditions: [
            { name: "Food Poisoning", probability: "High", description: "Bacterial contamination of food" },
            { name: "Viral Gastroenteritis", probability: "High", description: "Stomach flu causing loose stools" },
            { name: "IBS", probability: "Medium", description: "Irritable Bowel Syndrome — chronic digestive condition" },
        ],
        homeRemedies: ["ORS solution — sip frequently", "BRAT diet (Banana, Rice, Apple, Toast)", "Pomegranate juice", "Curd/Yogurt with rice", "Avoid dairy and spicy food"],
        warningSignals: ["Blood in stool", "Severe dehydration (no urine, dry mouth)", "Fever > 102°F with diarrhea", "Diarrhea lasting > 3 days", "Severe abdominal cramps"],
        severity: "Yellow",
        relatedMedicines: ["Electral ORS", "Eldoper", "Domstal 10"]
    },
    {
        id: "sp_008", symptom: "Skin Rash / Itching", icon: "🔴",
        conditions: [
            { name: "Allergic Reaction", probability: "High", description: "Histamine response to allergen" },
            { name: "Fungal Infection", probability: "Medium", description: "Ringworm, jock itch, or athlete's foot" },
            { name: "Eczema", probability: "Medium", description: "Chronic inflammatory skin condition" },
        ],
        homeRemedies: ["Aloe vera gel application", "Cold compress", "Coconut oil for dryness", "Neem paste application", "Avoid hot water baths"],
        warningSignals: ["Spreading rash with fever", "Pus-filled blisters", "Facial swelling with rash", "Difficulty breathing with hives", "Dark purple spots"],
        severity: "Green",
        relatedMedicines: ["Cetirizine (Cetzine)", "Betnovate-N Cream", "Candid-B Cream"]
    },
    {
        id: "sp_009", symptom: "Chest Pain", icon: "💔",
        conditions: [
            { name: "Gastric Pain (GERD)", probability: "Medium", description: "Acid reflux mimicking heart pain" },
            { name: "Muscle Strain", probability: "Medium", description: "Chest wall muscle injury" },
            { name: "Cardiac Event", probability: "Low", description: "Heart attack or angina — EMERGENCY" },
        ],
        homeRemedies: ["If mild: antacid trial", "Deep breathing exercises", "Avoid lying flat after eating", "Warm compress on chest wall"],
        warningSignals: ["Pain radiating to left arm/jaw", "Shortness of breath", "Sweating with chest pain", "Dizziness or fainting", "Chest tightness worsening with exertion"],
        severity: "Red",
        relatedMedicines: ["Pan-D", "Gelusil MPS", "Ecosprin 75"]
    },
    {
        id: "sp_010", symptom: "Fatigue / Weakness", icon: "😴",
        conditions: [
            { name: "Anemia", probability: "High", description: "Low hemoglobin/iron causing fatigue" },
            { name: "Vitamin D Deficiency", probability: "High", description: "Common in India, causes chronic tiredness" },
            { name: "Thyroid Disorder", probability: "Medium", description: "Hypothyroidism causing sluggishness" },
        ],
        homeRemedies: ["Iron-rich diet (spinach, dates, jaggery)", "Morning sunlight 15-20 minutes", "Regular moderate exercise", "Adequate sleep (7-8 hours)", "Ashwagandha-infused milk"],
        warningSignals: ["Unexplained weight loss", "Extreme fatigue not relieved by rest", "Pale skin and brittle nails", "Heart palpitations", "Swollen ankles"],
        severity: "Yellow",
        relatedMedicines: ["Autrin", "Becosules", "Neurobion Forte", "Shelcal 500"]
    },
    {
        id: "sp_011", symptom: "Eye Problems", icon: "👁️",
        conditions: [
            { name: "Digital Eye Strain", probability: "High", description: "Screen fatigue causing dry, tired eyes" },
            { name: "Conjunctivitis", probability: "Medium", description: "Infection causing red, watery eyes" },
            { name: "Allergic Eye", probability: "Medium", description: "Pollen/dust allergy affecting eyes" },
        ],
        homeRemedies: ["20-20-20 rule (every 20min, look 20ft away for 20sec)", "Cold cucumber slices", "Rose water drops", "Wash eyes with clean cold water", "Reduce screen brightness"],
        warningSignals: ["Sudden vision loss", "Severe eye pain", "Flashing lights or floaters", "Pus discharge from eyes", "Eye swelling with fever"],
        severity: "Green",
        relatedMedicines: ["Tears Naturale"]
    },
    {
        id: "sp_012", symptom: "Nausea / Vomiting", icon: "🤮",
        conditions: [
            { name: "Food Poisoning", probability: "High", description: "Contaminated food or water" },
            { name: "Gastritis", probability: "Medium", description: "Stomach lining inflammation" },
            { name: "Pregnancy (if applicable)", probability: "Low", description: "Morning sickness in early pregnancy" },
        ],
        homeRemedies: ["Ginger tea or raw ginger", "Sip lemon water slowly", "Crackers or dry toast", "Peppermint tea", "Avoid strong smells"],
        warningSignals: ["Vomiting blood", "Inability to keep fluids down for 24hrs", "Severe abdominal pain", "Signs of dehydration", "Head injury preceding vomiting"],
        severity: "Yellow",
        relatedMedicines: ["Emeset 4", "Domstal 10", "Electral ORS"]
    },
    {
        id: "sp_013", symptom: "Anxiety / Stress", icon: "😰",
        conditions: [
            { name: "Generalized Anxiety", probability: "High", description: "Excessive worry and tension" },
            { name: "Panic Disorder", probability: "Medium", description: "Sudden intense fear episodes" },
            { name: "Thyroid Disorder", probability: "Low", description: "Hyperthyroidism can mimic anxiety" },
        ],
        homeRemedies: ["Deep breathing (4-7-8 technique)", "Meditation and mindfulness", "Regular physical exercise", "Chamomile or lavender tea", "Journaling thoughts", "Reduce caffeine intake"],
        warningSignals: ["Thoughts of self-harm", "Panic attacks lasting > 30 minutes", "Inability to function daily", "Substance use to cope", "Social isolation"],
        severity: "Yellow",
        relatedMedicines: ["Becosules"]
    },
    {
        id: "sp_014", symptom: "Breathing Difficulty", icon: "🫁",
        conditions: [
            { name: "Asthma", probability: "High", description: "Airway narrowing causing wheezing" },
            { name: "Allergic Bronchitis", probability: "Medium", description: "Allergic reaction in bronchial tubes" },
            { name: "Pneumonia", probability: "Low", description: "Lung infection — needs medical attention" },
        ],
        homeRemedies: ["Steam inhalation", "Sit upright, don't lie down", "Pursed lip breathing", "Avoid triggers (dust, smoke)", "Warm fluids"],
        warningSignals: ["Blue lips or fingernails", "Cannot speak full sentences", "Rapid breathing > 30/min", "Chest pain with breathing", "Confusion or drowsiness"],
        severity: "Red",
        relatedMedicines: ["Asthalin Inhaler", "Montair LC"]
    },
    {
        id: "sp_015", symptom: "Menstrual Issues", icon: "🩸",
        conditions: [
            { name: "Dysmenorrhea (Cramps)", probability: "High", description: "Painful menstrual cramps, very common" },
            { name: "PCOS", probability: "Medium", description: "Hormonal imbalance causing irregular periods" },
            { name: "Endometriosis", probability: "Low", description: "Tissue growth outside uterus" },
        ],
        homeRemedies: ["Hot water bottle on lower abdomen", "Ginger tea with honey", "Light yoga and stretching", "Fennel seed water", "Dark chocolate (magnesium)"],
        warningSignals: ["Extremely heavy bleeding (soaking pad hourly)", "Period lasting > 7 days", "Severe pain not relieved by painkillers", "No periods for 3+ months", "Bleeding between periods"],
        severity: "Yellow",
        relatedMedicines: ["Meftal Spas", "Combiflam"]
    },
];

// Body part mapping for the symptom selector UI
export const BODY_PARTS = [
    { id: "head", label: "Head / Brain", icon: "🧠", relatedSymptoms: ["Headache", "Anxiety / Stress"] },
    { id: "eyes", label: "Eyes", icon: "👁️", relatedSymptoms: ["Eye Problems"] },
    { id: "throat", label: "Throat / Nose", icon: "🫁", relatedSymptoms: ["Cold & Cough", "Breathing Difficulty"] },
    { id: "chest", label: "Chest / Heart", icon: "💔", relatedSymptoms: ["Chest Pain", "Breathing Difficulty"] },
    { id: "stomach", label: "Stomach / Abdomen", icon: "🤢", relatedSymptoms: ["Stomach Pain", "Nausea / Vomiting", "Diarrhea"] },
    { id: "back", label: "Back / Spine", icon: "🦴", relatedSymptoms: ["Back Pain"] },
    { id: "joints", label: "Joints / Muscles", icon: "🦵", relatedSymptoms: ["Joint Pain"] },
    { id: "skin", label: "Skin", icon: "🔴", relatedSymptoms: ["Skin Rash / Itching"] },
    { id: "general", label: "General / Full Body", icon: "🌡️", relatedSymptoms: ["Fever", "Fatigue / Weakness"] },
    { id: "reproductive", label: "Reproductive", icon: "🩸", relatedSymptoms: ["Menstrual Issues"] },
];

// Pain types for the symptom form
export const PAIN_TYPES = [
    { id: "throbbing", label: "Throbbing", icon: "💥" },
    { id: "sharp", label: "Sharp / Stabbing", icon: "🔪" },
    { id: "dull", label: "Dull Ache", icon: "😣" },
    { id: "burning", label: "Burning", icon: "🔥" },
    { id: "cramping", label: "Cramping", icon: "🌀" },
    { id: "tingling", label: "Tingling / Numbness", icon: "⚡" },
    { id: "pressure", label: "Pressure / Tightness", icon: "💪" },
    { id: "itching", label: "Itching", icon: "🐛" },
];

// Duration options
export const DURATION_OPTIONS = [
    { id: "just_started", label: "Just Started", icon: "⏱️" },
    { id: "few_hours", label: "Few Hours", icon: "🕐" },
    { id: "1_2_days", label: "1-2 Days", icon: "📅" },
    { id: "3_7_days", label: "3-7 Days", icon: "📆" },
    { id: "1_2_weeks", label: "1-2 Weeks", icon: "🗓️" },
    { id: "chronic", label: "Chronic (Months+)", icon: "♾️" },
];

// Additional symptoms checkboxes
export const ADDITIONAL_SYMPTOMS = [
    { id: "fever", label: "Fever", icon: "🌡️" },
    { id: "nausea", label: "Nausea", icon: "🤢" },
    { id: "fatigue", label: "Fatigue", icon: "😴" },
    { id: "dizziness", label: "Dizziness", icon: "😵" },
    { id: "loss_appetite", label: "Loss of Appetite", icon: "🍽️" },
    { id: "insomnia", label: "Insomnia", icon: "🛌" },
    { id: "sweating", label: "Excessive Sweating", icon: "💦" },
    { id: "weight_change", label: "Weight Change", icon: "⚖️" },
    { id: "mood_changes", label: "Mood Changes", icon: "😔" },
    { id: "swelling", label: "Swelling", icon: "🎈" },
];

// Trigger factors
export const TRIGGER_OPTIONS = [
    { id: "stress", label: "Stress", icon: "😰" },
    { id: "food", label: "After Eating", icon: "🍔" },
    { id: "exercise", label: "Physical Activity", icon: "🏋️" },
    { id: "weather", label: "Weather Change", icon: "🌦️" },
    { id: "sleep", label: "Lack of Sleep", icon: "😴" },
    { id: "screen", label: "Screen Time", icon: "💻" },
    { id: "allergy", label: "Allergen Exposure", icon: "🌸" },
    { id: "medication", label: "After Medication", icon: "💊" },
];
