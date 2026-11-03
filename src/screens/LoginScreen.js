import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import styles from '../styles/styles';


export default function LoginScreen({onCriarConta}) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      // Não é preciso navegar: o App.js percebe o login e mostra a Home.
    } catch (e) {
      setErro(e.code === 'auth/network-request-failed'
        ? 'Sem conexão com a internet.'
        : 'E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
      <Text style={[styles.titulo, { textAlign: 'center' }]}>Entrar</Text>

      <TextInput
        style={styles.campo}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.campo}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      <Pressable style={styles.botao} onPress={entrar} disabled={carregando}>
        {carregando
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.textoBotao}>Entrar</Text>}
      </Pressable>

      <Pressable onPress={onCriarConta}>
        <Text style={styles.link}>Não tem conta? Criar conta</Text>
      </Pressable>

      <Pressable style={[styles.texto, {textAlign: 'center'}, {paddingTop: 8}]} onPress={() => sendPasswordResetEmail(auth, email)} disabled={carregando}>
        {carregando
          ? <ActivityIndicator color="#7166bb" />
          : <Text style={styles.textoBotao}>Esqueci minha senha</Text>}
      </Pressable>
    </SafeAreaView>
  );
}