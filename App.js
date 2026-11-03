import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './src/services/firebase';
import styles from './src/styles/styles';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import CadastrarUsuarioScreen from './src/screens/CadastrarUsuario';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [telaPublica, setTelaPublica] = useState('login');

  useEffect(() => {
    // Executa ao abrir o app e sempre que alguém entra ou sai.
    const cancelar = onAuthStateChanged(auth, (u) => {
      setUsuario(u);
      setVerificando(false);
      setTelaPublica('login'); 
    });
    return cancelar;
  }, []);

  if (verificando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  let telaSemLogin = <LoginScreen onCriarConta={() => setTelaPublica('criarConta')} />;
  if (telaPublica === 'criarConta') {
    telaSemLogin = <CadastrarUsuarioScreen onVoltar={() => setTelaPublica('login')} />;
  }

  return (
    <SafeAreaProvider>
      {usuario ? <MainScreen /> : telaSemLogin}
    </SafeAreaProvider>
  );
}