import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ConfirmarExclusaoMapa({ mapa, ocupado, erro, onCancelar, onConfirmar }) {
  return <Modal transparent animationType="fade" onRequestClose={() => { if (!ocupado) onCancelar(); }}>
    <View style={styles.fundo}>
      <View style={styles.cartao}>
        <Text style={styles.titulo}>Apagar mapa mental?</Text>
        <Text style={styles.texto}>O mapa “{mapa.titulo}” será removido da sua conta. Essa ação não pode ser desfeita.</Text>
        {!!erro && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
        <Pressable style={styles.excluir} disabled={ocupado} onPress={onConfirmar} accessibilityRole="button"><Text style={styles.textoExcluir}>{ocupado ? 'Apagando…' : 'Apagar mapa'}</Text></Pressable>
        <Pressable style={styles.cancelar} disabled={ocupado} onPress={onCancelar} accessibilityRole="button"><Text style={styles.textoCancelar}>Cancelar</Text></Pressable>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  fundo: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(15,23,42,0.4)' },
  cartao: { width: '100%', maxWidth: 420, backgroundColor: '#FFF', padding: 24, borderRadius: 20 },
  titulo: { color: '#1E293B', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  texto: { color: '#64748B', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  excluir: { backgroundColor: '#B91C1C', borderRadius: 12, padding: 15, alignItems: 'center' },
  textoExcluir: { color: '#FFF', fontWeight: '700' },
  cancelar: { padding: 14, alignItems: 'center' },
  textoCancelar: { color: '#475569', fontWeight: '600' },
  erro: { color: '#B91C1C', marginBottom: 12 },
});
