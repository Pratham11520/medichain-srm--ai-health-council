// Indian Medications Dataset — In-House Reference Database
// Cross-referenced with 1mg.com and Apollo Pharmacy catalogs

export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  category: string;
  type: string;
  dosage: string;
  priceRange: string;
  genericPrice: string;
  uses: string[];
  sideEffects: string[];
  contraindications: string[];
  availability: string[];
}

export const INDIAN_MEDICINES: Medicine[] = [
  // --- ANALGESICS / PAIN RELIEF ---
  {
    id: "med_001", brandName: "Dolo 650", genericName: "Paracetamol 650mg", category: "Analgesic",
    type: "Tablet", dosage: "1 tablet every 6-8 hours (max 4/day)", priceRange: "₹30-35 (15 tab)",
    genericPrice: "₹15-20", uses: ["Fever", "Headache", "Body pain", "Cold"],
    sideEffects: ["Nausea", "Liver damage (overdose)"], contraindications: ["Liver disease", "Alcohol use"],
    availability: ["1mg", "Apollo", "Netmeds", "PharmEasy"]
  },
  {
    id: "med_002", brandName: "Crocin Advance", genericName: "Paracetamol 500mg", category: "Analgesic",
    type: "Tablet", dosage: "1-2 tablets every 4-6 hours", priceRange: "₹25-30 (15 tab)",
    genericPrice: "₹10-15", uses: ["Mild fever", "Headache", "Toothache"],
    sideEffects: ["Rarely nausea"], contraindications: ["Liver impairment"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },
  {
    id: "med_003", brandName: "Combiflam", genericName: "Ibuprofen 400mg + Paracetamol 325mg", category: "Analgesic",
    type: "Tablet", dosage: "1 tablet 2-3 times daily after food", priceRange: "₹40-50 (20 tab)",
    genericPrice: "₹20-25", uses: ["Body pain", "Joint pain", "Dental pain", "Menstrual cramps"],
    sideEffects: ["Stomach irritation", "Acidity"], contraindications: ["Peptic ulcer", "Kidney disease", "Aspirin allergy"],
    availability: ["1mg", "Apollo", "Netmeds", "PharmEasy"]
  },
  {
    id: "med_004", brandName: "Voveran SR", genericName: "Diclofenac Sodium 100mg", category: "NSAID",
    type: "Tablet", dosage: "1 tablet once daily after food", priceRange: "₹50-70 (15 tab)",
    genericPrice: "₹25-35", uses: ["Severe joint pain", "Back pain", "Arthritis", "Post-surgical pain"],
    sideEffects: ["Stomach ulcers", "Dizziness"], contraindications: ["Heart disease", "GI bleeding", "Kidney issues"],
    availability: ["1mg", "Apollo"]
  },

  // --- ANTIBIOTICS ---
  {
    id: "med_005", brandName: "Augmentin 625 Duo", genericName: "Amoxicillin + Clavulanic Acid", category: "Antibiotic",
    type: "Tablet", dosage: "1 tablet twice daily for 5-7 days", priceRange: "₹180-220 (10 tab)",
    genericPrice: "₹90-120", uses: ["Bacterial infections", "Sinus infection", "UTI", "Skin infections"],
    sideEffects: ["Diarrhea", "Nausea", "Rash"], contraindications: ["Penicillin allergy", "Liver issues"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },
  {
    id: "med_006", brandName: "Azithral 500", genericName: "Azithromycin 500mg", category: "Antibiotic",
    type: "Tablet", dosage: "1 tablet once daily for 3 days", priceRange: "₹100-130 (3 tab)",
    genericPrice: "₹50-70", uses: ["Throat infection", "Chest infection", "Ear infection", "Typhoid"],
    sideEffects: ["Stomach upset", "Headache", "Dizziness"], contraindications: ["Liver disease", "QT prolongation"],
    availability: ["1mg", "Apollo", "Netmeds", "PharmEasy"]
  },
  {
    id: "med_007", brandName: "Cifran 500", genericName: "Ciprofloxacin 500mg", category: "Antibiotic",
    type: "Tablet", dosage: "1 tablet twice daily for 7-14 days", priceRange: "₹80-100 (10 tab)",
    genericPrice: "₹40-55", uses: ["UTI", "Respiratory infections", "GI infections"],
    sideEffects: ["Tendon damage", "Nausea", "Diarrhea"], contraindications: ["Children", "Pregnancy", "Epilepsy"],
    availability: ["1mg", "Apollo"]
  },

  // --- ANTACIDS / GI ---
  {
    id: "med_008", brandName: "Pan-D", genericName: "Pantoprazole 40mg + Domperidone 30mg", category: "Antacid",
    type: "Capsule", dosage: "1 capsule before breakfast", priceRange: "₹120-150 (15 cap)",
    genericPrice: "₹50-70", uses: ["Acidity", "GERD", "Stomach ulcers", "Bloating"],
    sideEffects: ["Headache", "Diarrhea"], contraindications: ["Long-term use without doctor advice"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },
  {
    id: "med_009", brandName: "Gelusil MPS", genericName: "Magaldrate + Simethicone", category: "Antacid",
    type: "Syrup/Tablet", dosage: "1-2 tablets after meals or 10ml syrup", priceRange: "₹90-110",
    genericPrice: "₹40-60", uses: ["Quick acidity relief", "Gas", "Indigestion"],
    sideEffects: ["Constipation (rare)"], contraindications: ["Kidney disease"],
    availability: ["1mg", "Apollo", "Netmeds", "PharmEasy"]
  },
  {
    id: "med_010", brandName: "Rantac 150", genericName: "Ranitidine 150mg", category: "Antacid",
    type: "Tablet", dosage: "1 tablet twice daily before meals", priceRange: "₹30-40 (10 tab)",
    genericPrice: "₹15-20", uses: ["Hyperacidity", "Peptic ulcer", "GERD"],
    sideEffects: ["Headache", "Constipation"], contraindications: ["Kidney disease"],
    availability: ["1mg", "Apollo"]
  },

  // --- ANTIHISTAMINES / ALLERGY ---
  {
    id: "med_011", brandName: "Cetirizine (Cetzine)", genericName: "Cetirizine 10mg", category: "Antihistamine",
    type: "Tablet", dosage: "1 tablet once daily at night", priceRange: "₹30-50 (10 tab)",
    genericPrice: "₹10-20", uses: ["Allergies", "Runny nose", "Sneezing", "Itching", "Hives"],
    sideEffects: ["Drowsiness", "Dry mouth"], contraindications: ["Kidney disease", "Driving"],
    availability: ["1mg", "Apollo", "Netmeds", "PharmEasy"]
  },
  {
    id: "med_012", brandName: "Allegra 120", genericName: "Fexofenadine 120mg", category: "Antihistamine",
    type: "Tablet", dosage: "1 tablet once daily", priceRange: "₹150-180 (10 tab)",
    genericPrice: "₹80-100", uses: ["Seasonal allergies", "Chronic urticaria"],
    sideEffects: ["Headache", "Nausea"], contraindications: ["Kidney impairment"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },

  // --- COLD & COUGH ---
  {
    id: "med_013", brandName: "Sinarest", genericName: "Paracetamol + Phenylephrine + CPM", category: "Cold & Cough",
    type: "Tablet", dosage: "1 tablet 3 times daily", priceRange: "₹40-60 (15 tab)",
    genericPrice: "₹20-30", uses: ["Common cold", "Nasal congestion", "Headache with cold"],
    sideEffects: ["Drowsiness", "Dry mouth"], contraindications: ["Hypertension", "Heart disease"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },
  {
    id: "med_014", brandName: "Benadryl Cough Syrup", genericName: "Diphenhydramine + Ammonium Chloride", category: "Cold & Cough",
    type: "Syrup", dosage: "5-10ml 3 times daily", priceRange: "₹90-120 (100ml)",
    genericPrice: "₹40-60", uses: ["Dry cough", "Allergic cough", "Throat irritation"],
    sideEffects: ["Drowsiness", "Dizziness"], contraindications: ["Asthma", "COPD"],
    availability: ["1mg", "Apollo", "Netmeds", "PharmEasy"]
  },
  {
    id: "med_015", brandName: "Alex Cough Syrup", genericName: "Dextromethorphan + CPM", category: "Cold & Cough",
    type: "Syrup", dosage: "10ml 3-4 times daily", priceRange: "₹80-100 (100ml)",
    genericPrice: "₹35-50", uses: ["Dry cough", "Persistent cough"],
    sideEffects: ["Drowsiness", "Nausea"], contraindications: ["MAO inhibitor use"],
    availability: ["1mg", "Apollo"]
  },

  // --- ANTI-DIABETICS ---
  {
    id: "med_016", brandName: "Glycomet (GP)", genericName: "Metformin 500mg", category: "Anti-diabetic",
    type: "Tablet", dosage: "1 tablet twice daily with meals", priceRange: "₹30-50 (10 tab)",
    genericPrice: "₹15-25", uses: ["Type 2 Diabetes", "PCOS", "Insulin resistance"],
    sideEffects: ["GI upset", "Metallic taste", "Lactic acidosis (rare)"], contraindications: ["Kidney failure", "Liver disease", "Alcoholism"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },

  // --- CARDIAC ---
  {
    id: "med_017", brandName: "Ecosprin 75", genericName: "Aspirin 75mg", category: "Cardiac",
    type: "Tablet", dosage: "1 tablet once daily", priceRange: "₹20-30 (14 tab)",
    genericPrice: "₹10-15", uses: ["Blood thinning", "Heart attack prevention", "Stroke prevention"],
    sideEffects: ["GI bleeding", "Bruising"], contraindications: ["Active bleeding", "Peptic ulcer", "Children"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },
  {
    id: "med_018", brandName: "Aten 50", genericName: "Atenolol 50mg", category: "Cardiac",
    type: "Tablet", dosage: "1 tablet once daily", priceRange: "₹30-40 (14 tab)",
    genericPrice: "₹12-20", uses: ["Hypertension", "Angina", "Heart rate control"],
    sideEffects: ["Fatigue", "Dizziness", "Cold extremities"], contraindications: ["Asthma", "Heart block", "Bradycardia"],
    availability: ["1mg", "Apollo"]
  },

  // --- ANTI-EMETICS ---
  {
    id: "med_019", brandName: "Emeset 4", genericName: "Ondansetron 4mg", category: "Anti-emetic",
    type: "Tablet", dosage: "1 tablet before meals when nausea occurs", priceRange: "₹50-70 (10 tab)",
    genericPrice: "₹25-35", uses: ["Nausea", "Vomiting", "Motion sickness", "Post-operative nausea"],
    sideEffects: ["Headache", "Constipation"], contraindications: ["QT prolongation"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },
  {
    id: "med_020", brandName: "Domstal 10", genericName: "Domperidone 10mg", category: "Anti-emetic",
    type: "Tablet", dosage: "1 tablet before meals 3 times daily", priceRange: "₹40-55 (10 tab)",
    genericPrice: "₹15-25", uses: ["Nausea", "Bloating", "Gastroparesis"],
    sideEffects: ["Dry mouth", "Headache"], contraindications: ["GI bleeding", "Prolactinoma"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },

  // --- RESPIRATORY ---
  {
    id: "med_021", brandName: "Asthalin Inhaler", genericName: "Salbutamol 100mcg", category: "Respiratory",
    type: "Inhaler", dosage: "1-2 puffs when needed", priceRange: "₹120-150",
    genericPrice: "₹80-100", uses: ["Asthma", "Bronchospasm", "Wheezing", "COPD"],
    sideEffects: ["Tremor", "Palpitations", "Headache"], contraindications: ["Cardiac arrhythmia"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },
  {
    id: "med_022", brandName: "Montair LC", genericName: "Montelukast 10mg + Levocetirizine 5mg", category: "Respiratory",
    type: "Tablet", dosage: "1 tablet at night", priceRange: "₹150-180 (10 tab)",
    genericPrice: "₹60-80", uses: ["Allergic rhinitis", "Asthma prevention", "Seasonal allergies"],
    sideEffects: ["Drowsiness", "Headache"], contraindications: ["Phenylketonuria"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },

  // --- DERMATOLOGY ---
  {
    id: "med_023", brandName: "Betnovate-N Cream", genericName: "Betamethasone + Neomycin", category: "Dermatology",
    type: "Cream", dosage: "Apply thin layer 2-3 times daily", priceRange: "₹60-80 (20g)",
    genericPrice: "₹30-40", uses: ["Skin infections", "Eczema", "Dermatitis", "Rashes"],
    sideEffects: ["Skin thinning", "Stretch marks"], contraindications: ["Fungal infections", "Acne", "Long-term face use"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },

  // --- MUSCLE RELAXANTS ---
  {
    id: "med_024", brandName: "Myospaz", genericName: "Chlorzoxazone 250mg + Paracetamol 500mg", category: "Muscle Relaxant",
    type: "Tablet", dosage: "1 tablet 2-3 times daily", priceRange: "₹60-80 (10 tab)",
    genericPrice: "₹30-40", uses: ["Muscle spasm", "Stiffness", "Back pain"],
    sideEffects: ["Drowsiness", "GI upset"], contraindications: ["Liver disease"],
    availability: ["1mg", "Apollo"]
  },

  // --- VITAMINS / SUPPLEMENTS ---
  {
    id: "med_025", brandName: "Shelcal 500", genericName: "Calcium + Vitamin D3", category: "Supplement",
    type: "Tablet", dosage: "1 tablet twice daily", priceRange: "₹130-160 (15 tab)",
    genericPrice: "₹60-80", uses: ["Calcium deficiency", "Bone health", "Osteoporosis prevention"],
    sideEffects: ["Constipation", "Bloating"], contraindications: ["Hypercalcemia", "Kidney stones"],
    availability: ["1mg", "Apollo", "Netmeds", "PharmEasy"]
  },
  {
    id: "med_026", brandName: "Becosules", genericName: "B-Complex + Vitamin C", category: "Supplement",
    type: "Capsule", dosage: "1 capsule daily", priceRange: "₹30-40 (20 cap)",
    genericPrice: "₹15-20", uses: ["Vitamin B deficiency", "Mouth ulcers", "General weakness"],
    sideEffects: ["Rarely GI upset"], contraindications: ["None significant"],
    availability: ["1mg", "Apollo", "Netmeds", "PharmEasy"]
  },
  {
    id: "med_027", brandName: "Neurobion Forte", genericName: "Vitamin B1 + B6 + B12", category: "Supplement",
    type: "Tablet", dosage: "1 tablet daily", priceRange: "₹35-50 (30 tab)",
    genericPrice: "₹15-25", uses: ["Nerve health", "Tingling/Numbness", "B12 deficiency"],
    sideEffects: ["Rarely GI upset", "Allergic reaction"], contraindications: ["None significant"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },

  // --- ANTI-DIARRHEAL ---
  {
    id: "med_028", brandName: "Eldoper", genericName: "Loperamide 2mg", category: "Anti-diarrheal",
    type: "Capsule", dosage: "2 capsules initially, then 1 after each loose stool", priceRange: "₹25-35 (4 cap)",
    genericPrice: "₹10-15", uses: ["Acute diarrhea", "Traveler's diarrhea"],
    sideEffects: ["Constipation", "Abdominal cramps"], contraindications: ["Bloody diarrhea", "Bacterial dysentery", "Children < 6"],
    availability: ["1mg", "Apollo"]
  },
  {
    id: "med_029", brandName: "Electral ORS", genericName: "Oral Rehydration Salts", category: "Rehydration",
    type: "Powder", dosage: "1 sachet in 1 litre water, sip throughout day", priceRange: "₹20-25 (4 sachets)",
    genericPrice: "₹10-12", uses: ["Dehydration", "Diarrhea", "Vomiting", "Heat stroke"],
    sideEffects: ["None"], contraindications: ["None"],
    availability: ["1mg", "Apollo", "Netmeds", "PharmEasy"]
  },

  // --- ANTI-FUNGAL ---
  {
    id: "med_030", brandName: "Candid-B Cream", genericName: "Clotrimazole + Beclometasone", category: "Anti-fungal",
    type: "Cream", dosage: "Apply twice daily for 2-4 weeks", priceRange: "₹80-100 (15g)",
    genericPrice: "₹40-50", uses: ["Fungal skin infections", "Ringworm", "Jock itch", "Athlete's foot"],
    sideEffects: ["Burning sensation", "Skin irritation"], contraindications: ["Viral skin infections"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },

  // --- ANTISPASMODICS ---
  {
    id: "med_031", brandName: "Meftal Spas", genericName: "Mefenamic Acid + Dicyclomine", category: "Antispasmodic",
    type: "Tablet", dosage: "1 tablet 2-3 times daily", priceRange: "₹60-80 (10 tab)",
    genericPrice: "₹25-35", uses: ["Menstrual cramps", "Abdominal cramps", "Spasmodic pain"],
    sideEffects: ["Drowsiness", "Dry mouth", "GI upset"], contraindications: ["GI obstruction", "Myasthenia gravis"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },

  // --- THYROID ---
  {
    id: "med_032", brandName: "Thyronorm", genericName: "Levothyroxine 50mcg", category: "Thyroid",
    type: "Tablet", dosage: "1 tablet on empty stomach in the morning", priceRange: "₹120-140 (120 tab)",
    genericPrice: "₹60-80", uses: ["Hypothyroidism", "Goiter", "TSH management"],
    sideEffects: ["Palpitations (overdose)", "Weight loss", "Tremors"], contraindications: ["Hyperthyroidism", "Adrenal insufficiency"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },

  // --- EYE DROPS ---
  {
    id: "med_033", brandName: "Tears Naturale", genericName: "Hydroxypropyl Methylcellulose", category: "Ophthalmology",
    type: "Eye Drops", dosage: "1-2 drops in affected eye 3-4 times daily", priceRange: "₹130-160 (10ml)",
    genericPrice: "₹60-80", uses: ["Dry eyes", "Eye irritation", "Screen fatigue"],
    sideEffects: ["Temporary blurred vision"], contraindications: ["Contact lenses (wait 15 min)"],
    availability: ["1mg", "Apollo"]
  },

  // --- IRON SUPPLEMENTS ---
  {
    id: "med_034", brandName: "Autrin", genericName: "Ferrous Fumarate + Folic Acid + B12", category: "Supplement",
    type: "Capsule", dosage: "1 capsule daily with food", priceRange: "₹70-90 (30 cap)",
    genericPrice: "₹35-45", uses: ["Iron deficiency anemia", "Pregnancy support", "Fatigue"],
    sideEffects: ["Dark stools", "Constipation", "Nausea"], contraindications: ["Thalassemia", "Hemochromatosis"],
    availability: ["1mg", "Apollo", "Netmeds"]
  },
];

// Helper: search for medicine by keyword
export const searchMedicine = (query: string): Medicine[] => {
  const q = query.toLowerCase();
  return INDIAN_MEDICINES.filter(med =>
    med.brandName.toLowerCase().includes(q) ||
    med.genericName.toLowerCase().includes(q) ||
    med.category.toLowerCase().includes(q) ||
    med.uses.some(u => u.toLowerCase().includes(q))
  );
};

// Helper: get generic alternative text for a brand
export const getGenericAlternative = (brandName: string): Medicine | undefined => {
  return INDIAN_MEDICINES.find(m => m.brandName.toLowerCase() === brandName.toLowerCase());
};

// Generate 1mg search URL
export const get1mgUrl = (medicineName: string): string =>
  `https://www.1mg.com/search/all?name=${encodeURIComponent(medicineName)}`;

// Generate Apollo search URL
export const getApolloUrl = (medicineName: string): string =>
  `https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(medicineName)}`;

// Generate Netmeds search URL
export const getNetmedsUrl = (medicineName: string): string =>
  `https://www.netmeds.com/catalogsearch/result?q=${encodeURIComponent(medicineName)}`;

// Generate PharmEasy search URL
export const getPharmEasyUrl = (medicineName: string): string =>
  `https://pharmeasy.in/search/all?name=${encodeURIComponent(medicineName)}`;

// Generate JioMart Health search URL
export const getJioMartUrl = (medicineName: string): string =>
  `https://www.jiomart.com/search/${encodeURIComponent(medicineName)}`;
