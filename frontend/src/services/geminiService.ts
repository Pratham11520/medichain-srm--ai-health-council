import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserProfile, SymptomFormData } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found. Please add GEMINI_API_KEY to .env.local");
  return new GoogleGenAI({ apiKey });
};

// ==========================================
// Medical System Prompt — LLM Council Core
// ==========================================

const MEDICAL_SYSTEM_INSTRUCTION = `
You are 'MediBot', a highly advanced AI-powered medical council.
You provide factual, emotionally supportive, and prescriptive medical advice focused on the INDIAN healthcare context.

CORE RULES:
1. **Identity**: You are MediBot — an AI Health Council.
2. **Indian Context**: Always suggest medications available in INDIA. Reference brands sold on 1mg.com and Apollo Pharmacy.
3. **Generic Alternatives**: For EVERY branded medicine you suggest, also include a generic low-cost alternative.
4. **Medication Format**: Always present medications in a Markdown Table with columns: Type | Brand Name (India) | Generic Alternative (Low Cost) | Dosage/Usage | Approx. Price
5. **Home Remedies**: Include Indian home remedies (haldi milk, tulsi, jeera water, etc.) along with medical advice.
6. **Emotional Support**: Be empathetic and reassuring. Acknowledge the patient's feelings.
7. **Precautions**: Always list precautions and warning signs.
8. **Disclaimer**: End every response with: "*⚕️ Disclaimer: I am an AI assistant, not a licensed doctor. Please consult a qualified healthcare professional for serious conditions.*"
9. **Structured Output**: Use clear headings (##) with emojis, bullet points, and tables.
10. **Verification**: When possible, mention that medications can be verified on 1mg.com or Apollo Pharmacy.

RESPONSE STRUCTURE:
## 🩺 Assessment
[Brief empathetic diagnosis]

## 💊 Recommended Medication (Indian Context)
| Type | Brand Name (India) | Generic Alternative | Dosage | Approx. Price |
|---|---|---|---|---|
| [Type] | [Brand] | [Generic] | [Instructions] | [Price] |

## 🏡 Home Remedies & Lifestyle
* [Remedy with specific Indian context]

## ⚠️ Precautions & Warning Signs
* [Important precautions]

## 🏥 When to See a Doctor
* [Red flag symptoms]
`;

// ==========================================
// Chat Function — Main LLM Council
// Uses Gemini with Google Search Grounding
// ==========================================

export const chatWithGemini = async (
  message: string,
  history: string[],
  userProfile?: UserProfile
): Promise<{ text: string, groundingMetadata?: any }> => {
  const ai = getClient();

  let userContext = "";
  if (userProfile) {
    userContext = `Patient Details: Name: ${userProfile.name}, Age: ${userProfile.age}, Gender: ${userProfile.gender}, Height: ${userProfile.height}cm, Weight: ${userProfile.weight}kg. Location: India.`;
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      ${userContext}
      Conversation History: ${history.slice(-10).join('\n')}
      Patient: ${message}
    `,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: MEDICAL_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    }
  });

  return {
    text: response.text || "I apologize, I couldn't generate a response. Please try again.",
    groundingMetadata: response.candidates?.[0]?.groundingMetadata
  };
};

// ==========================================
// Nearby Medical Services — Google Maps
// ==========================================

export const getNearbyMedicalServices = async (userProfile: UserProfile): Promise<{ text: string, places: any[] }> => {
  const ai = getClient();

  if (!userProfile.location) {
    return { text: "Location permissions are required to find nearby doctors.", places: [] };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the 3 nearest General Physicians/Hospitals and 2 nearest Pharmacies near coordinates ${userProfile.location.lat}, ${userProfile.location.lng}. Provide their names, addresses, and any available contact info.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a helpful assistant that finds nearby medical services. Be specific about names and locations."
      }
    });

    return {
      text: response.text || "No nearby services found.",
      places: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error('Maps search error:', error);
    return { text: "Could not search for nearby services.", places: [] };
  }
};

// ==========================================
// Symptom Analysis — Deep Analysis Model
// ==========================================

export const analyzeSymptoms = async (formData: SymptomFormData, userProfile?: UserProfile): Promise<string> => {
  const ai = getClient();

  const prompt = `
    Perform a comprehensive medical analysis of these symptoms:
    
    PATIENT PROFILE:
    - Age: ${userProfile?.age || 'Unknown'}
    - Gender: ${userProfile?.gender || 'Unknown'}  
    - Weight: ${userProfile?.weight || 'Unknown'}kg
    - Height: ${userProfile?.height || 'Unknown'}cm
    
    SYMPTOMS:
    - Affected Area: ${formData.bodyPart}
    - Pain Type: ${formData.painType}
    - Intensity: ${formData.intensity}/10
    - Duration: ${formData.duration}
    - Additional Symptoms: ${formData.additionalSymptoms.join(', ') || 'None reported'}
    - Triggers: ${formData.triggers.join(', ') || 'None identified'}
    - Patient Description: ${formData.description || 'Not provided'}

    Provide a structured analysis with:
    
    ## 🔍 Potential Diagnosis
    [Top 2-3 possible conditions with probability: High/Medium/Low]
    
    ## 🎯 Severity Assessment
    [Green (Mild) / Yellow (Moderate) / Red (Severe)] — Explain why
    
    ## 💊 Recommended Medication (Indian Context)
    | Type | Brand (India) | Generic Alternative | Dosage | Approx. Price |
    |---|---|---|---|---|
    [Include at least 2-3 medications with generic alternatives]
    
    ## 🏡 Immediate Relief (Home Remedies)
    [Indian home remedies specific to the condition]
    
    ## ⚠️ Precautions
    [What to avoid and watch for]
    
    ## 🚨 See a Doctor If
    [Red flag symptoms that require immediate medical attention]
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: MEDICAL_SYSTEM_INSTRUCTION,
      temperature: 0.5,
    }
  });

  return response.text || "Analysis failed. Please try again.";
};

// ==========================================
// Report Analysis — Multi-modal (PDF/Image)
// ==========================================

export const analyzeMedicalReport = async (fileBase64: string, mimeType: string, userProfile?: UserProfile): Promise<string> => {
  const ai = getClient();

  let patientContext = "";
  if (userProfile) {
    patientContext = `Patient: ${userProfile.name}, Age: ${userProfile.age}, Gender: ${userProfile.gender}, Weight: ${userProfile.weight}kg.`;
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: fileBase64
          }
        },
        {
          text: `${patientContext}
          
You are MediBot, an expert medical report interpreter. Analyze this medical report (Image or PDF) comprehensively.

Provide your analysis in this EXACT structure:

## 📋 Report Overview
[What type of report is this? Blood test, X-ray, MRI, etc. Brief explanation of what this test checks.]

## 🔍 Key Findings
[List ALL values and findings. For each: What it is → Your value → Normal range → Status (Normal/Abnormal)]

## ⚠️ Abnormalities Detected
[Highlight any values outside normal range. Explain what each abnormality means in SIMPLE language a non-medical person can understand.]

## 💡 What This Means For You
[Explain the overall picture. What's happening in the body? Use simple analogies.]

## 💊 Recommended Actions
| Action | Details | Priority |
|---|---|---|
[Medications, supplements, dietary changes — all in Indian context with generic alternatives]

## 🥗 Diet & Lifestyle Recommendations
[Specific Indian food recommendations, exercise, lifestyle changes]

## 🏥 Doctor Visit Assessment
[Not Urgent / Schedule Soon / Visit Immediately] — Explain why

## ⚠️ Precautions
[What to avoid, medications interactions, lifestyle warnings]`
        }
      ]
    },
    config: {
      systemInstruction: "You are an expert medical report analyst who explains complex medical reports in simple, empathetic language. Always provide actionable advice with Indian medications and home remedies.",
    }
  });

  return response.text || "Could not analyze the report. Please ensure the file is clear and legible.";
};