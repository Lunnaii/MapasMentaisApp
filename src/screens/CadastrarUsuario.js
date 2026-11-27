import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormularioUsuario from '../components/FormularUsuario';
import { cadastrarOutroUsuario } from '../services/usuarios';
import styles from '../styles/styles';

export default function CadastrarUsuarioScreen() {
  return (
    <SafeAreaView style={styles.authContainer}>
      <KeyboardAvoidingView
        style={styles.authScroll}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.authScroll}
          contentContainerStyle={styles.authCadastroConteudo}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authCabecalho}>
            <Text style={styles.authTitulo}>EXPANSÃO</Text>
            <Text style={styles.authTitulo}>MENTAL</Text>
          </View>
          <FormularioUsuario textoBotao="Cadastrar" onSalvar={cadastrarOutroUsuario} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}