import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native';
import { traduzirErroCadastro } from '../services/usuarios';
import styles from '../styles/styles';

export default function FormularioUsuario({ textoBotao, onSalvar }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function salvar() {
    setErro('');
    setSucesso('');

    if (!nome.trim() || !email.trim() || !senha) {
      setErro('Preencha nome, e-mail e senha.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }

    setCarregando(true);
    try {
      await onSalvar(nome.trim(), email.trim(), senha);
      setSucesso(`Usuário ${email.trim()} cadastrado!`);
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmacao('');
    } catch (e) {
      setErro(traduzirErroCadastro(e.code));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <Text style={styles.authRotulo}>Nome</Text>
      <TextInput
        style={styles.authCampo}
        placeholder="Digite seu nome"
        placeholderTextColor="#94A3B8"
        value={nome}
        onChangeText={setNome}
      />
      <Text style={styles.authRotulo}>E-mail</Text>
      <TextInput
        style={styles.authCampo}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#94A3B8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.authRotulo}>Senha</Text>
      <TextInput
        style={styles.authCampo}
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor="#94A3B8"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <Text style={styles.authRotulo}>Confirmar senha</Text>
      <TextInput
        style={styles.authCampo}
        placeholder="Digite a senha novamente"
        placeholderTextColor="#94A3B8"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
      />

      {erro !== '' && <Text style={styles.authErro}>{erro}</Text>}
      {sucesso !== '' && <Text style={styles.authSucesso}>{sucesso}</Text>}

      <Pressable style={styles.authBotao} onPress={salvar} disabled={carregando}>
        {carregando
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.authTextoBotao}>{textoBotao}</Text>}
      </Pressable>
    </>
  );
}