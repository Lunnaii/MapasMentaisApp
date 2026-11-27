import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, reload, signOut } from 'firebase/auth';

import { auth } from './src/services/firebase';
import styles from './src/styles/styles';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import CriarContaScreen from './src/screens/CriarConta';
import VerificarEmail from './src/screens/VerificarEmail';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [telaPublica, setTelaPublica] = useState('login');
  const [emailVerificado, setEmailVerificado] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUsuario(u);
    setEmailVerificado(Boolean(u?.emailVerified));
    setVerificando(false);
    if (!u) setTelaPublica('login');
  }), []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (estado) => {
      if (estado !== 'active' || !auth.currentUser) return;
      try {
        await reload(auth.currentUser);
        setEmailVerificado(Boolean(auth.currentUser.emailVerified));
      } catch {
        // A próxima tentativa automática ou manual fará uma nova conferência.
      }
    });

    return () => subscription.remove();
  }, []);

  if (verificando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  async function voltarLogin() {
    await signOut(auth).catch(() => {});
    setUsuario(null);
    setEmailVerificado(false);
    setTelaPublica('login');
  }

  return (
    <SafeAreaProvider>
      {usuario
        ? emailVerificado
          ? <MainScreen />
          : <VerificarEmail
              email={usuario.email}
              onVerificado={() => setEmailVerificado(Boolean(auth.currentUser?.emailVerified))}
              onCancelar={voltarLogin}
            />
        : telaPublica === 'criarConta'
          ? <CriarContaScreen onVoltar={() => setTelaPublica('login')} />
          : <LoginScreen onCriarConta={() => setTelaPublica('criarConta')} />}
    </SafeAreaProvider>
  );
}
