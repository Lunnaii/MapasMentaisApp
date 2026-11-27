import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import styles from '../styles/styles';


export default function LoginScreen({ onCriarConta }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucessoSenha, setSucessoSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [carregandoSenha, setCarregandoSenha] = useState(false);

  async function redefinirSenha() {
    const emailLimpo = email.trim();

    if (!emailLimpo) {
      setSucessoSenha('');
      setErro('Informe seu e-mail antes de redefinir a senha.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setSucessoSenha('');
      setErro('Informe um e-mail válido.');
      return;
    }

    setErro('');
    setSucessoSenha('');
    setCarregandoSenha(true);

    try {
      auth.languageCode = 'pt-BR';
      await sendPasswordResetEmail(auth, emailLimpo);
      setSucessoSenha(`Enviamos um link de redefinição para ${emailLimpo}. Verifique sua caixa de entrada e o spam.`);
    } catch (e) {
      const mensagens = {
        'auth/invalid-email': 'Informe um e-mail válido.',
        'auth/user-not-found': 'Não encontramos uma conta com este e-mail.',
        'auth/too-many-requests': 'Muitas solicitações. Aguarde alguns minutos e tente novamente.',
        'auth/network-request-failed': 'Não foi possível conectar ao Firebase. Verifique sua internet.',
        'auth/operation-not-allowed': 'A redefinição de senha não está habilitada no Firebase.',
      };
      setErro(mensagens[e.code] || 'Não foi possível enviar o e-mail de redefinição.');
    } finally {
      setCarregandoSenha(false);
    }
  }

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
      const mensagens = {
        'auth/invalid-credential': 'E-mail ou senha inválidos.',
        'auth/invalid-email': 'Informe um e-mail válido.',
        'auth/user-disabled': 'Esta conta está desativada. Entre em contato com o administrador.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
        'auth/network-request-failed': 'Não foi possível conectar ao serviço de autenticação do Firebase. Verifique se a rede permite acesso ao Firebase.',
        'auth/operation-not-allowed': 'O login por e-mail e senha não está habilitado no Firebase.',
        'auth/invalid-api-key': 'A chave do Firebase está ausente ou inválida. Confira o arquivo .env.',
      };
      setErro(mensagens[e.code] || `Não foi possível entrar (${e.code || 'erro desconhecido'}).`);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authConteudo}>
        <View style={styles.authCabecalho}>
          <Text style={styles.authTitulo}>EXPANSÃO</Text>
          <Text style={styles.authTitulo}>MENTAL</Text>
        </View>

        <Text style={styles.authRotulo}>Usuário/e-mail</Text>
        <TextInput
          style={styles.authCampo}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={(texto) => {
            setEmail(texto);
            setErro('');
            setSucessoSenha('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.authRotulo}>Senha</Text>
        <TextInput
          style={styles.authCampo}
          placeholder="Digite sua senha"
          placeholderTextColor="#94A3B8"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {erro !== '' && <Text style={styles.authErro}>{erro}</Text>}
        {sucessoSenha !== '' && <Text style={styles.authSucesso}>{sucessoSenha}</Text>}

        <Pressable style={styles.authBotao} onPress={entrar} disabled={carregando}>
          {carregando
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.authTextoBotao}>Entrar</Text>}
        </Pressable>

        <Pressable
          onPress={redefinirSenha}
          disabled={carregando || carregandoSenha}
        >
          {carregandoSenha
            ? <ActivityIndicator color="#526BA3" style={{ marginTop: 18 }} />
            : <Text style={styles.authLink}>Esqueci minha senha</Text>}
        </Pressable>

        <View style={styles.authAlternador}>
          <Text style={styles.authTextoAlternador}>Novo por aqui? </Text>
          <Pressable onPress={onCriarConta}>
            <Text style={styles.authLinkDestaque}>Crie sua conta!</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
