export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number;
  height: number;
  location: {
    lat: number;
    lng: number;
  };
  history?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  hash: string;
  prevHash: string;
  isReportAnalysis?: boolean;
  medications?: VerifiedMedicationDisplay[];
}

export interface VerifiedMedicationDisplay {
  brandName: string;
  genericName: string;
  category: string;
  dosage: string;
  priceRange: string;
  genericPrice: string;
  isVerified: boolean;
  buyLinks: { label: string; url: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export enum AnalysisType {
  GENERAL_CHAT = 'GENERAL_CHAT',
  SYMPTOM_CHECKER = 'SYMPTOM_CHECKER',
  REPORT_ANALYSIS = 'REPORT_ANALYSIS',
}

export interface Block {
  index: number;
  timestamp: number;
  data: string;
  previousHash: string;
  hash: string;
}

export interface SymptomFormData {
  bodyPart: string;
  painType: string;
  intensity: string;
  duration: string;
  additionalSymptoms: string[];
  triggers: string[];
  description: string;
}