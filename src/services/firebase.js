import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Recupera uma instância já criada (recarregamento do Expo) ou cria uma nova.
function obterApp(nome) {
  return getApps().find((a) => a.name === nome) ?? initializeApp(firebaseConfig, nome);
}

function obterAuth(app, persistence) {
  try {
    return initializeAuth(app, { persistence });
  } catch {
    return getAuth(app);
  }
}

// Instância principal: guarda a sessão no aparelho (igual ao Tutorial 6).
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = Platform.OS === 'web'
  ? getAuth(app)
  : obterAuth(app, getReactNativePersistence(AsyncStorage));

// Instância secundária: usada só para cadastrar outras pessoas.
// A sessão fica apenas na memória e não substitui o usuário logado.
const authSecundario = obterAuth(obterApp('secundario'), inMemoryPersistence);

export { auth, authSecundario };
