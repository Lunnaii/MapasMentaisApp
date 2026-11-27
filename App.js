import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { auth } from './src/services/firebase';
import styles from './src/styles/styles';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import CriarContaScreen from './src/screens/CriarConta';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [telaPublica, setTelaPublica] = useState('login');

  useEffect(() => {
    let cancelar = () => {};
    let ativo = true;

    async function prepararAutenticacao() {
      // Sempre solicita as credenciais ao abrir, mesmo quando havia sessão salva.
      await signOut(auth).catch(() => {});
      if (!ativo) return;

      cancelar = onAuthStateChanged(auth, (u) => {
        setUsuario(u);
        setVerificando(false);
      });
    }

    prepararAutenticacao();
    return () => {
      ativo = false;
      cancelar();
    };
  }, []);

  if (verificando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {usuario ? <MainScreen /> : telaPublica === 'criarConta'
        ? <CriarContaScreen onVoltar={() => setTelaPublica('login')} />
        : <LoginScreen onCriarConta={() => setTelaPublica('criarConta')} />}
    </SafeAreaProvider>
  );
}
