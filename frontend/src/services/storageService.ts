// ==========================================
// Encrypted Local Storage Service
// All data encrypted with AES-256-GCM
// ==========================================

import { encryptData, decryptData, secureStorage } from './blockchainService';
import { UserProfile, ChatSession } from '../types';

const STORAGE_PREFIX = 'medichain_';

// Get encryption password from user email (simple but effective for local storage)
function getPassword(email: string): string {
    return `MediChain-${email}-SecureKey-2024`;
}

// --- User Profile Storage ---

export async function saveUserProfile(profile: UserProfile): Promise<void> {
    try {
        const password = getPassword(profile.email);
        const json = JSON.stringify(profile);
        const encrypted = await encryptData(json, password);

        // Add to hash ledger
        await secureStorage.addBlock(`PROFILE_SAVE:${profile.email}:${Date.now()}`);

        localStorage.setItem(`${STORAGE_PREFIX}profile_${profile.email}`, encrypted);
        localStorage.setItem(`${STORAGE_PREFIX}last_email`, profile.email);
    } catch (error) {
        console.error('Failed to save profile:', error);
    }
}

export async function loadUserProfile(): Promise<UserProfile | null> {
    try {
        const email = localStorage.getItem(`${STORAGE_PREFIX}last_email`);
        if (!email) return null;

        const encrypted = localStorage.getItem(`${STORAGE_PREFIX}profile_${email}`);
        if (!encrypted) return null;

        const password = getPassword(email);
        const json = await decryptData(encrypted, password);
        return JSON.parse(json);
    } catch (error) {
        console.error('Failed to load profile:', error);
        return null;
    }
}

// --- Chat History Storage ---

export async function saveChatHistory(email: string, sessions: ChatSession[]): Promise<void> {
    try {
        const password = getPassword(email);
        const json = JSON.stringify(sessions);
        const encrypted = await encryptData(json, password);

        // Record in hash ledger
        await secureStorage.addBlock(`HISTORY_SAVE:${email}:${sessions.length}:${Date.now()}`);

        localStorage.setItem(`${STORAGE_PREFIX}history_${email}`, encrypted);
    } catch (error) {
        console.error('Failed to save chat history:', error);
    }
}

export async function loadChatHistory(email: string): Promise<ChatSession[]> {
    try {
        const encrypted = localStorage.getItem(`${STORAGE_PREFIX}history_${email}`);
        if (!encrypted) return [];

        const password = getPassword(email);
        const json = await decryptData(encrypted, password);
        return JSON.parse(json);
    } catch (error) {
        console.error('Failed to load chat history:', error);
        return [];
    }
}

// --- User Preferences ---

export interface UserPreferences {
    theme: 'dark' | 'light';
    notifications: boolean;
    language: string;
    fontSize: 'small' | 'medium' | 'large';
}

const DEFAULT_PREFS: UserPreferences = {
    theme: 'dark',
    notifications: true,
    language: 'en',
    fontSize: 'medium'
};

export async function savePreferences(email: string, prefs: UserPreferences): Promise<void> {
    try {
        const password = getPassword(email);
        const encrypted = await encryptData(JSON.stringify(prefs), password);
        localStorage.setItem(`${STORAGE_PREFIX}prefs_${email}`, encrypted);
    } catch (error) {
        console.error('Failed to save preferences:', error);
    }
}

export async function loadPreferences(email: string): Promise<UserPreferences> {
    try {
        const encrypted = localStorage.getItem(`${STORAGE_PREFIX}prefs_${email}`);
        if (!encrypted) return DEFAULT_PREFS;

        const password = getPassword(email);
        const json = await decryptData(encrypted, password);
        return JSON.parse(json);
    } catch (error) {
        return DEFAULT_PREFS;
    }
}

// --- Clear all user data ---
export function clearUserData(email: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}profile_${email}`);
    localStorage.removeItem(`${STORAGE_PREFIX}history_${email}`);
    localStorage.removeItem(`${STORAGE_PREFIX}prefs_${email}`);
    localStorage.removeItem(`${STORAGE_PREFIX}last_email`);
}
