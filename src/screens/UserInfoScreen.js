import { Pressable, ScrollView, Text, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import styles from '../styles/styles';

export default function UserInfoScreen({ onClose }) {
  const usuario = auth.currentUser;

  return (
    <ScrollView contentContainerStyle={styles.conteudoPainel}>
      <View style={styles.cabecalhoPainel}>
        <Text style={styles.titulo}>Sobre o usuário</Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar painel">
          <Text style={styles.textoFechar}>X</Text>
        </Pressable>
      </View>
      <View style={styles.cartao}>
        <Text style={styles.texto}>Nome: {usuario?.displayName || '(não informado)'}</Text>
        <Text style={styles.texto}>E-mail: {usuario?.email}</Text>
        <Text style={styles.texto}>ID (uid): {usuario?.uid}</Text>
        <Text style={styles.texto}>Conta criada em: {usuario?.metadata.creationTime
          ? new Date(usuario.metadata.creationTime).toLocaleString('pt-BR')
          : 'Indisponível'}</Text>
        <Text style={styles.texto}>Último acesso: {usuario?.metadata.lastSignInTime
          ? new Date(usuario.metadata.lastSignInTime).toLocaleString('pt-BR')
          : 'Indisponível'}</Text>
      </View>
      <Pressable style={styles.botaoSair} onPress={() => signOut(auth)} accessibilityRole="button">
        <Text style={styles.textoSair}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}