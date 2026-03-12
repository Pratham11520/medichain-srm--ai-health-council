import { UserProfile, SymptomFormData } from '../types';

// ========================
// API Configuration
// ========================

const API_URL = import.meta.env.VITE_API_URL ?? "";

// --- JWT Token Management ---
let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
    _authToken = token;
    if (token) {
        localStorage.setItem('medichain_jwt', token);
    } else {
        localStorage.removeItem('medichain_jwt');
    }
}

export function getAuthToken(): string | null {
    if (_authToken) return _authToken;
    _authToken = localStorage.getItem('medichain_jwt');
    return _authToken;
}

function authHeaders(): Record<string, string> {
    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.detail ?? `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
}


// ========================
// AI Response Type (Industry-Grade)
// ========================

export interface AIResponse {
    text: string;
    provider: string;
    confidence: 'high' | 'medium' | 'fallback' | 'cached' | 'unknown';
    quality_score: number;
    providers_consulted: Array<{
        name: string;
        status: string;
        quality_score?: number;
        length?: number;
        error?: string;
    }>;
    response_id: string;
    verified_medicines?: number;
    blockchain_block?: number;
}


// ========================
// Authentication
// ========================

export const authWithGoogle = async (idToken: string): Promise<{
    token: string;
    user: { email: string; name: string; picture?: string };
}> => {
    const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
    });
    const data = await handleResponse<{ token: string; user: any; status: string }>(response);
    setAuthToken(data.token);
    return data;
};

export const requestEmailOTP = async (email: string): Promise<{ status: string; message: string }> => {
    const response = await fetch(`${API_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleResponse<{ status: string; message: string }>(response);
};

export const verifyEmailOTP = async (email: string, otp: string, name: string = ''): Promise<{
    token: string;
    user: { email: string; name: string };
}> => {
    const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, name })
    });
    const data = await handleResponse<{ token: string; user: any; status: string }>(response);
    setAuthToken(data.token);
    return data;
};


// ========================
// User Data Sync (Zero-Knowledge Encrypted)
// ========================

export const syncUserData = async (dataType: string, encryptedData: string): Promise<any> => {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/api/user/data`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ data_type: dataType, encrypted_data: encryptedData })
        });
        return handleResponse(response);
    } catch (error) {
        console.warn('Data sync failed (non-fatal):', error);
        return null;
    }
};

export const loadUserDataFromServer = async (dataType?: string): Promise<any> => {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const url = dataType
            ? `${API_URL}/api/user/data?data_type=${dataType}`
            : `${API_URL}/api/user/data`;
        const response = await fetch(url, { headers: authHeaders() });
        return handleResponse(response);
    } catch (error) {
        console.warn('Data load failed (non-fatal):', error);
        return null;
    }
};

export const deleteUserDataFromServer = async (): Promise<any> => {
    const token = getAuthToken();
    if (!token) return null;

    const response = await fetch(`${API_URL}/api/user/data`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return handleResponse(response);
};


// ========================
// AI Chat & Analysis
// ========================

export const chatWithBackend = async (
    message: string,
    history: string[],
    userProfile?: UserProfile
): Promise<AIResponse> => {
    const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            message,
            history: history.slice(-20),
            user_context: userProfile ? JSON.stringify({
                name: userProfile.name,
                age: userProfile.age,
                gender: userProfile.gender,
                weight: userProfile.weight,
                height: userProfile.height,
            }) : ""
        })
    });
    return handleResponse<AIResponse>(response);
};

export const analyzeSymptomsBackend = async (
    formData: SymptomFormData,
    userProfile: UserProfile
): Promise<AIResponse> => {
    const response = await fetch(`${API_URL}/api/analyze-symptoms`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            symptoms: formData,
            user_context: JSON.stringify({
                name: userProfile.name,
                age: userProfile.age,
                gender: userProfile.gender,
            })
        })
    });
    return handleResponse<AIResponse>(response);
};

export const analyzeReportBackend = async (
    fileContent: string,
    fileType: string,
    userProfile: UserProfile
): Promise<AIResponse & { detected_type?: string }> => {
    const response = await fetch(`${API_URL}/api/analyze-report`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            file_content: fileContent,
            file_type: fileType,
            user_context: JSON.stringify({ name: userProfile.name, age: userProfile.age })
        })
    });
    return handleResponse(response);
};

export const analyzeReportFileBackend = async (
    file: File,
    userProfile: UserProfile
): Promise<AIResponse & { detected_type: string; extraction_method: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_context', JSON.stringify({
        name: userProfile.name,
        age: userProfile.age,
        gender: userProfile.gender
    }));

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/api/analyze-report-file`, {
        method: 'POST',
        headers,
        body: formData,
    });
    return handleResponse(response);
};

export const checkDrugInteractions = async (
    medicines: string[],
    userContext?: string
): Promise<AIResponse & { medicines_checked: string[] }> => {
    const response = await fetch(`${API_URL}/api/drug-interactions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ medicines, user_context: userContext ?? "" })
    });
    return handleResponse(response);
};


// ========================
// Medicine Database
// ========================

export interface MedicineRecord {
    medicine_name: string;
    salt_composition: string;
    drug_class: string;
    primary_uses: string;
    secondary_uses: string;
    mechanism_of_action: string;
    dosage_adult: string;
    dosage_pediatric: string;
    contraindications: string;
    common_side_effects: string;
    serious_side_effects: string;
    drug_interactions: string;
    pregnancy_safety: string;
    lactation_safety: string;
    renal_warning: string;
    hepatic_warning: string;
    food_interactions: string;
    alcohol_warning: string;
    overdose_management: string;
    monitoring_parameters: string;
    storage_instructions: string;
    source_references: string;
    confidence_score: string;
    manufacturer: string;
    price_inr: string;
    dosage_form: string;
    is_high_risk: string;
}

export interface VerifyResult {
    verified: boolean;
    match_type: 'exact' | 'partial' | 'none';
    medicine: MedicineRecord | null;
}

export const searchMedicines = async (query: string, limit = 10): Promise<MedicineRecord[]> => {
    try {
        const response = await fetch(`${API_URL}/api/medicines/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        const data = await handleResponse<{ results: MedicineRecord[] }>(response);
        return data.results || [];
    } catch (error) {
        console.error('Medicine search failed:', error);
        return [];
    }
};

export const verifyMedicine = async (name: string): Promise<VerifyResult> => {
    try {
        const response = await fetch(`${API_URL}/api/medicines/verify?name=${encodeURIComponent(name)}`);
        return handleResponse<VerifyResult>(response);
    } catch (error) {
        console.error('Medicine verification failed:', error);
        return { verified: false, match_type: 'none', medicine: null };
    }
};

export const getMedicineStats = async () => {
    try {
        const response = await fetch(`${API_URL}/api/medicines/stats`);
        return handleResponse(response);
    } catch (error) {
        console.error('Medicine stats failed:', error);
        return { total_medicines: 0, unique_drug_classes: 0, unique_manufacturers: 0 };
    }
};

export const getLLMStatus = async () => {
    try {
        const response = await fetch(`${API_URL}/api/llm/status`);
        return handleResponse(response);
    } catch {
        return null;
    }
};


// ========================
// Logout Helper
// ========================

export function clearAllUserData() {
    setAuthToken(null);
    // Clear ALL medichain keys from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('medichain_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    // Also clear the session
    localStorage.removeItem('medichain_user_enc');
    localStorage.removeItem('medichain_last_email');
}
