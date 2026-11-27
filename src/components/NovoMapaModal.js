import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { validarTamanhoMapa } from '../utils/mapaLayout';

export default function NovoMapaModal({ onCancelar, onCriar }) {
  const [largura, setLargura] = useState('144');
  const [altura, setAltura] = useState('240');
  const [erro, setErro] = useState('');

  function criar() {
    try {
      const tamanhoFolha = validarTamanhoMapa(largura.trim(), altura.trim());
      onCriar({ titulo: 'Novo mapa mental', tamanhoFolha });
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.fundo}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onCancelar} accessibilityLabel="Cancelar criação do mapa" />
        <ScrollView contentContainerStyle={styles.area} keyboardShouldPersistTaps="handled">
          <View style={styles.cartao}>
            <Text style={styles.titulo}>Tamanho do mapa</Text>
            <Text style={styles.descricao}>Escolha as dimensões da folha e do arquivo compartilhado em pixels.</Text>
            <View style={styles.campos}>
              <View style={styles.campoArea}>
                <Text style={styles.rotulo}>Largura (px)</Text>
                <TextInput style={styles.campo} keyboardType="number-pad" value={largura} onChangeText={setLargura} maxLength={4} accessibilityLabel="Largura do mapa em pixels" />
              </View>
              <Text style={styles.vezes}>×</Text>
              <View style={styles.campoArea}>
                <Text style={styles.rotulo}>Altura (px)</Text>
                <TextInput style={styles.campo} keyboardType="number-pad" value={altura} onChangeText={setAltura} maxLength={4} accessibilityLabel="Altura do mapa em pixels" />
              </View>
            </View>
            <View style={styles.presets}>
              {[[144, 240], [640, 480], [1080, 1920]].map(([w, h]) => (
                <Pressable key={w} style={styles.preset} onPress={() => { setLargura(String(w)); setAltura(String(h)); setErro(''); }} accessibilityRole="button">
                  <Text style={styles.textoPreset}>{w} × {h}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.limite}>De 64 a 4096 pixels em cada dimensão.</Text>
            {!!erro && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            <Pressable style={styles.criar} onPress={criar} accessibilityRole="button"><Text style={styles.textoCriar}>Criar mapa</Text></Pressable>
            <Pressable style={styles.cancelar} onPress={onCancelar} accessibilityRole="button"><Text style={styles.textoCancelar}>Cancelar</Text></Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)' },
  area: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  cartao: { width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#FFF', borderRadius: 22, padding: 22 },
  titulo: { color: '#1E293B', fontSize: 22, fontWeight: '700', marginBottom: 10 },
  descricao: { color: '#64748B', lineHeight: 20, marginBottom: 22 },
  campos: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  campoArea: { flex: 1 },
  rotulo: { color: '#475569', fontSize: 12, marginBottom: 8 },
  campo: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 18, color: '#1E293B' },
  vezes: { fontSize: 20, color: '#94A3B8', marginTop: 20 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  preset: { backgroundColor: '#EEF1F7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 12 },
  textoPreset: { color: '#263F78', fontSize: 11, fontWeight: '600' },
  limite: { color: '#94A3B8', fontSize: 11, marginVertical: 16 },
  erro: { color: '#B91C1C', marginBottom: 12, fontSize: 13 },
  criar: { backgroundColor: '#263F78', borderRadius: 12, padding: 15, alignItems: 'center' },
  textoCriar: { color: '#FFF', fontWeight: '700' },
  cancelar: { padding: 14, alignItems: 'center' },
  textoCancelar: { color: '#64748B' },
});
