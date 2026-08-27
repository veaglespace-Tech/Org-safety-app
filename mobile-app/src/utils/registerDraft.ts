import AsyncStorage from '@react-native-async-storage/async-storage';

export const REGISTRATION_DRAFT_KEYS = Object.freeze({
  organisation: 'register.organisation',
  admin: 'register.admin',
  selectedPlan: 'register.selectedPlan',
});

export const getRegistrationDraft = async (key: string): Promise<any | null> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setRegistrationDraft = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Failed to save registration draft:', err);
  }
};

export const clearRegistrationDraft = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
};

export const clearAllRegistrationDrafts = async (): Promise<void> => {
  try {
    await Promise.all(
      Object.values(REGISTRATION_DRAFT_KEYS).map((k) => AsyncStorage.removeItem(k))
    );
  } catch {}
};
