import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const SESSION_KEY = 'ai_session_unlocked';
const SALT = 'SALT_midnight_court_2024';

const getCorrectPinHash = async () => {
  const correctPin = process.env.EXPO_PUBLIC_AI_PIN || '1234';
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    correctPin + SALT
  );
};

export const pinAuth = {
  async verifyPin(pin) {
    const correctHash = await getCorrectPinHash();
    const enteredHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin + SALT
    );
    return enteredHash === correctHash;
  },

  async isUnlocked() {
    return await AsyncStorage.getItem(SESSION_KEY) === 'true';
  },

  async unlock() {
    await AsyncStorage.setItem(SESSION_KEY, 'true');
  },

  async lock() {
    await AsyncStorage.removeItem(SESSION_KEY);
  }
};
