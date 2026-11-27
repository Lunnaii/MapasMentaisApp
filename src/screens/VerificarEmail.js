import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { reload, sendEmailVerification } from 'firebase/auth';
import { auth } from '../services/firebase';
import styles from '../styles/styles';

export default function VerificarEmail({ email, onVerificado, onCancelar }) {
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('Enviamos um link de verificação para seu e-mail.');

  const conferirVerificacao = useCallback(async () => {
    const usuario = auth.currentUser;
    if (!usuario) {
      setErro('Sua sessão expirou. Entre novamente.');
      return;
    }

    setVerificando(true);
    setErro('');

    try {
      await reload(usuario);
      if (usuario.emailVerified) {
        onVerificado();
      } else {
        setMensagem('Ainda não verificamos seu e-mail. Abra o link recebido e toque em verificar novamente.');
      }
    } catch {
      setErro('Não foi possível verificar agora. Confira sua internet e tente novamente.');
    } finally {
      setVerificando(false);
    }
  }, [onVerificado]);

  async function reenviar() {
    const usuario = auth.currentUser;
    if (!usuario) {
      setErro('Sua sessão expirou. Entre novamente.');
      return;
    }

    setReenviando(true);
    setErro('');

    try {
      auth.languageCode = 'pt-BR';
      await sendEmailVerification(usuario);
      setMensagem('Enviamos outro e-mail de verificação. Confira sua caixa de entrada e o spam.');
    } catch (e) {
      setErro(e.code === 'auth/too-many-requests'
        ? 'Muitos pedidos foram feitos. Aguarde alguns minutos antes de tentar novamente.'
        : 'Não foi possível reenviar o e-mail. Tente novamente.');
    } finally {
      setReenviando(false);
    }
  }

  useEffect(() => {
    const intervalo = setInterval(conferirVerificacao, 5000);
    return () => clearInterval(intervalo);
  }, [conferirVerificacao]);

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authConteudo}>
        <View style={styles.authCabecalho}>
          <Text style={styles.authTitulo}>EXPANSÃO</Text>
          <Text style={styles.authTitulo}>MENTAL</Text>
        </View>

        <Text style={styles.authRotulo}>Confirme seu e-mail</Text>
        <Text style={[styles.authSubtitulo, { marginTop: 0, marginBottom: 18, lineHeight: 21 }]}>
          {mensagem}{email ? `\n${email}` : ''}
        </Text>

        {erro !== '' && <Text style={styles.authErro}>{erro}</Text>}

        <Pressable
          style={styles.authBotao}
          onPress={conferirVerificacao}
          disabled={verificando || reenviando}
        >
          {verificando
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.authTextoBotao}>Já confirmei meu e-mail</Text>}
        </Pressable>

        <Pressable onPress={reenviar} disabled={verificando || reenviando}>
          {reenviando
            ? <ActivityIndicator color="#526BA3" style={{ marginTop: 18 }} />
            : <Text style={styles.authLink}>Reenviar e-mail</Text>}
        </Pressable>

        <Pressable onPress={onCancelar}>
          <Text style={styles.authVoltar}>Voltar para o login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
