import { ScrollView, Text } from 'react-native';
import FormularioUsuario from '../components/FormularUsuario';
import { cadastrarOutroUsuario } from '../services/usuarios';
import styles from '../styles/styles';

export default function CadastrarUsuarioScreen() {
  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Cadastrar usuário</Text>
      <Text style={styles.texto}>
        Cadastre outra pessoa para acessar o sistema. Você continuará conectado com a sua conta.
      </Text>

      <FormularioUsuario textoBotao="Cadastrar" onSalvar={cadastrarOutroUsuario} />
    </ScrollView>
  );
}