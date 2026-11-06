import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ListaConexoes({ itens, conexoes, onSelecionar, onFechar }) {
  return <Modal transparent animationType="fade" onRequestClose={onFechar}>
    <View style={styles.fundo}>
      <View style={styles.cartao}>
        <View style={styles.cabecalho}><Text style={styles.titulo}>Conexões do mapa</Text><Pressable style={styles.fechar} onPress={onFechar} accessibilityRole="button" accessibilityLabel="Fechar lista de conexões"><Ionicons name="close" size={22} color="#475569" /></Pressable></View>
        <ScrollView>
          {conexoes.length === 0 && <Text style={styles.vazio}>Use a ferramenta Conexão e toque em dois itens para criar uma ligação.</Text>}
          {conexoes.map((conexao) => <Pressable key={conexao.id} style={styles.linha} onPress={() => onSelecionar(conexao.id)} accessibilityRole="button">
            <Ionicons name="git-branch-outline" size={20} color={conexao.estilo?.cor || '#64748B'} />
            <Text style={styles.nome} numberOfLines={2}>{itens.find((item) => item.id === conexao.origem)?.texto || 'Item'} → {itens.find((item) => item.id === conexao.destino)?.texto || 'Item'}</Text>
            <Ionicons name="create-outline" size={20} color="#5B6EF5" />
          </Pressable>)}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  cartao: { width: '100%', maxWidth: 480, maxHeight: '80%', backgroundColor: '#FFF', borderRadius: 20, padding: 18 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  titulo: { fontSize: 18, color: '#1E293B', fontWeight: '700' },
  fechar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  nome: { flex: 1, color: '#334155', fontSize: 13 },
  vazio: { color: '#64748B', lineHeight: 22, paddingVertical: 16 },
});
