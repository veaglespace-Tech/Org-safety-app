import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveDraft = async (key, data) => {
  try {
    await AsyncStorage.setItem(`draft_${key}`, JSON.stringify(data));
  } catch (e) {}
};

export const loadDraft = async (key) => {
  try {
    const data = await AsyncStorage.getItem(`draft_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const clearDraft = async (key) => {
  try {
    await AsyncStorage.removeItem(`draft_${key}`);
  } catch (e) {}
};

// Mock legacy migration if needed
export const migrateLegacyDraft = async () => {};
