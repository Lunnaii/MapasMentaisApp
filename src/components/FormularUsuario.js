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
      <TextInput style={styles.campo} placeholder="Nome" value={nome} onChangeText={setNome} />
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
        placeholder="Senha (mínimo 6 caracteres)"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <TextInput
        style={styles.campo}
        placeholder="Confirme a senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
      />

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}
      {sucesso !== '' && <Text style={styles.sucesso}>{sucesso}</Text>}

      <Pressable style={styles.botao} onPress={salvar} disabled={carregando}>
        {carregando
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.textoBotao}>{textoBotao}</Text>}
      </Pressable>
    </>
  );
}