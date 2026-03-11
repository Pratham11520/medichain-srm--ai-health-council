// ==========================================
// Medication Verification Service
// Cross-references AI suggestions with
// Indian medicine database + pharmacy URLs
// ==========================================

import { INDIAN_MEDICINES, searchMedicine, get1mgUrl, getApolloUrl, getNetmedsUrl, getPharmEasyUrl, type Medicine } from '../data/indianMedicines';

export interface VerifiedMedication {
    brandName: string;
    genericName: string;
    category: string;
    dosage: string;
    priceRange: string;
    genericPrice: string;
    isVerified: boolean;
    buyLinks: { label: string; url: string }[];
    contraindications: string[];
    sideEffects: string[];
    genericAlternative?: {
        name: string;
        price: string;
    };
}

// Try to match an AI-suggested medicine name against our database
export function verifyMedication(medicineName: string): VerifiedMedication | null {
    const query = medicineName.toLowerCase().trim();

    // Direct match by brand name
    let match = INDIAN_MEDICINES.find(m =>
        m.brandName.toLowerCase().includes(query) ||
        query.includes(m.brandName.toLowerCase().split(' ')[0])
    );

    // Try generic name match
    if (!match) {
        match = INDIAN_MEDICINES.find(m =>
            m.genericName.toLowerCase().includes(query) ||
            query.includes(m.genericName.toLowerCase().split(' ')[0])
        );
    }

    if (!match) return null;

    return {
        brandName: match.brandName,
        genericName: match.genericName,
        category: match.category,
        dosage: match.dosage,
        priceRange: match.priceRange,
        genericPrice: match.genericPrice,
        isVerified: true,
        buyLinks: [
            { label: '1mg', url: get1mgUrl(match.brandName) },
            { label: 'Apollo', url: getApolloUrl(match.brandName) },
            { label: 'Netmeds', url: getNetmedsUrl(match.brandName) },
            { label: 'PharmEasy', url: getPharmEasyUrl(match.brandName) },
        ],
        contraindications: match.contraindications,
        sideEffects: match.sideEffects,
        genericAlternative: {
            name: match.genericName,
            price: match.genericPrice
        }
    };
}

// Batch verify medications from AI response text
export function verifyMedicationsInText(text: string): VerifiedMedication[] {
    const verified: VerifiedMedication[] = [];
    const seen = new Set<string>();

    for (const med of INDIAN_MEDICINES) {
        // Check if the brand name or generic name appears in the text
        const brandLower = med.brandName.toLowerCase();
        const genericLower = med.genericName.toLowerCase().split(' ')[0]; // first word of generic

        if (
            text.toLowerCase().includes(brandLower.split(' ')[0]) ||
            text.toLowerCase().includes(genericLower)
        ) {
            if (!seen.has(med.id)) {
                seen.add(med.id);
                const v = verifyMedication(med.brandName);
                if (v) verified.push(v);
            }
        }
    }

    return verified;
}

// Get unverified medication links (for medicines not in our database)
export function getUnverifiedLinks(medicineName: string): { label: string; url: string }[] {
    return [
        { label: '1mg', url: get1mgUrl(medicineName) },
        { label: 'Apollo', url: getApolloUrl(medicineName) },
        { label: 'Netmeds', url: getNetmedsUrl(medicineName) },
        { label: 'PharmEasy', url: getPharmEasyUrl(medicineName) },
    ];
}

// Search our database by symptom/use
export function findMedicinesByUse(symptom: string): Medicine[] {
    return searchMedicine(symptom);
}
