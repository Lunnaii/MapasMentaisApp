import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import RasterizadorMapa from './RasterizadorMapa';
import { incorporarImagens } from '../services/imagens';
import { compartilharArquivo } from '../services/compartilhamento';
import { gerarSvgMapa } from '../utils/exportarMapa';
import { gerarArquivoMapa } from '../utils/arquivoMapa';
import { obterTamanhoFolha } from '../utils/mapaLayout';

function PrepararMapa({ mapa, formato, onOcupado, onTentarNovamente }) {
  const [area] = useState(() => obterTamanhoFolha(mapa));
  const [svg, setSvg] = useState(null);
  const [png, setPng] = useState(null);
  const [erro, setErro] = useState('');
  const [compartilhando, setCompartilhando] = useState(false);
  useEffect(() => {
    let ativo = true;
    incorporarImagens(mapa).then((comImagens) => {
      if (ativo) setSvg(gerarSvgMapa(comImagens));
    }).catch(() => { if (ativo) setErro('Não foi possível carregar o mapa e suas imagens. Tente novamente.'); });
    return () => { ativo = false; };
  }, [mapa]);
  const concluirPrevia = useCallback((imagem) => setPng(imagem), []);
  const falharPrevia = useCallback(() => setErro('Não foi possível preparar a prévia do mapa. Tente novamente.'), []);

  async function compartilhar() {
    if (!png || compartilhando) return;
    setCompartilhando(true);
    setErro('');
    onOcupado(true);
    try {
      const arquivo = await gerarArquivoMapa(mapa, formato, png);
      await compartilharArquivo(arquivo);
    } catch (e) {
      setErro(e.message || 'Não foi possível compartilhar o arquivo. Tente novamente.');
    } finally {
      setCompartilhando(false);
      onOcupado(false);
    }
  }

  return <View style={styles.preparacao}>
    <Text style={styles.rotulo}>Prévia do mapa selecionado</Text>
    <Text style={styles.nomeSelecionado} numberOfLines={2}>{mapa.titulo}</Text>
    <Text style={styles.medidas}>{area.width} × {area.height} px · {formato === 'pdf' ? 'PDF de uma página' : 'Imagem PNG'}</Text>
    <View style={styles.previa}>
      {png ? <Image source={{ uri: png }} resizeMode="contain" style={styles.imagem} accessibilityLabel={`Prévia de ${mapa.titulo}`} /> : !erro ? <View style={styles.carregando}><ActivityIndicator color="#263F78" /><Text style={styles.dica}>Preparando prévia…</Text></View> : <Ionicons name="image-outline" size={36} color="#94A3B8" />}
    </View>
    {svg && !png && !erro && <RasterizadorMapa svg={svg} area={area} onConcluido={concluirPrevia} onErro={falharPrevia} />}
    {!!erro && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
    {!!erro && !png && <Pressable style={styles.tentar} onPress={onTentarNovamente} accessibilityRole="button"><Text style={styles.textoTentar}>Tentar novamente</Text></Pressable>}
    <Text style={styles.dica}>O arquivo inclui o mapa inteiro, com imagens, textos e conexões.</Text>
    <Pressable style={[styles.compartilhar, (!png || compartilhando) && styles.desabilitado]} disabled={!png || compartilhando} onPress={compartilhar} accessibilityRole="button" accessibilityLabel={`Compartilhar ${mapa.titulo} em ${formato.toUpperCase()}`}>
      {compartilhando ? <ActivityIndicator color="#FFF" /> : <Ionicons name="share-outline" size={20} color="#FFF" />}
      <Text style={styles.textoCompartilhar}>{compartilhando ? 'Gerando arquivo…' : `Compartilhar ${formato.toUpperCase()}`}</Text>
    </Pressable>
  </View>;
}

export default function CompartilharMapaModal({ mapas, mapaInicialId = null, onFechar }) {
  const [selecionado, setSelecionado] = useState(mapaInicialId);
  const [formato, setFormato] = useState('pdf');
  const [ocupado, setOcupado] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const mapaSelecionado = mapas.find((mapa) => mapa.id === selecionado);
  return <Modal transparent animationType="slide" onRequestClose={() => { if (!ocupado) onFechar(); }}>
    <View style={styles.fundo}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.painel}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Compartilhar mapa</Text>
          <Pressable style={styles.fechar} disabled={ocupado} onPress={onFechar} accessibilityRole="button" accessibilityLabel="Fechar compartilhamento"><Ionicons name="close" size={23} color="#475569" /></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={styles.rotulo}>1. Selecione o mapa</Text>
          {mapas.length === 0 && <Text style={styles.dica}>Crie e salve um mapa antes de compartilhar.</Text>}
          {mapas.map((mapa) => <Pressable key={mapa.id} style={[styles.mapa, selecionado === mapa.id && styles.selecionado]} disabled={ocupado} onPress={() => { setSelecionado(mapa.id); setTentativa(0); }} accessibilityRole="button" accessibilityState={{ selected: selecionado === mapa.id }} accessibilityLabel={`Selecionar mapa ${mapa.titulo}`}>
            <Ionicons name={selecionado === mapa.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={selecionado === mapa.id ? '#263F78' : '#94A3B8'} />
            <Text style={styles.nomeMapa} numberOfLines={2}>{mapa.titulo}</Text>
          </Pressable>)}
          <Text style={styles.rotulo}>2. Escolha o formato</Text>
          <View style={styles.formatos}>{[{ id: 'pdf', titulo: 'Documento PDF', icone: 'document-text-outline' }, { id: 'png', titulo: 'Imagem PNG', icone: 'image-outline' }].map((opcao) => <Pressable key={opcao.id} style={[styles.formato, formato === opcao.id && styles.selecionado]} disabled={ocupado} onPress={() => setFormato(opcao.id)} accessibilityRole="button" accessibilityState={{ selected: formato === opcao.id }}>
            <Ionicons name={opcao.icone} size={24} color="#263F78" /><Text style={styles.textoFormato}>{opcao.titulo}</Text>
          </Pressable>)}</View>
          {mapaSelecionado ? <PrepararMapa key={`${mapaSelecionado.id}-${mapaSelecionado.atualizadoEm || ''}-${tentativa}`} mapa={mapaSelecionado} formato={formato} onOcupado={setOcupado} onTentarNovamente={() => setTentativa((valor) => valor + 1)} /> : <Text style={styles.selecione}>Selecione um mapa acima para ver a prévia e compartilhar.</Text>}
        </ScrollView>
      </SafeAreaView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  painel: { height: '92%', width: '100%', maxWidth: 640, alignSelf: 'center', backgroundColor: '#FFF', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12 },
  titulo: { color: '#1E293B', fontSize: 20, fontWeight: '700' },
  fechar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  conteudo: { padding: 20, paddingBottom: 28 },
  rotulo: { color: '#475569', fontSize: 13, fontWeight: '700', marginBottom: 12, marginTop: 10 },
  mapa: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, marginBottom: 8 },
  selecionado: { borderColor: '#263F78', backgroundColor: '#EEF1F7' },
  nomeMapa: { flex: 1, color: '#334155', fontSize: 14, fontWeight: '500' },
  formatos: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  formato: { flex: 1, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16 },
  textoFormato: { color: '#334155', fontSize: 12, fontWeight: '600' },
  preparacao: { marginTop: 6 },
  nomeSelecionado: { color: '#1E293B', fontWeight: '700', fontSize: 15 },
  medidas: { color: '#64748B', fontSize: 12, marginTop: 5, marginBottom: 12 },
  previa: { height: 220, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 8, marginBottom: 12 },
  imagem: { width: '100%', height: '100%' },
  carregando: { alignItems: 'center', gap: 10 },
  dica: { color: '#64748B', fontSize: 12, lineHeight: 18 },
  compartilhar: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#263F78', borderRadius: 12, minHeight: 50, padding: 14 },
  textoCompartilhar: { color: '#FFF', fontWeight: '700' },
  desabilitado: { opacity: 0.5 },
  selecione: { color: '#64748B', fontSize: 13, lineHeight: 20, textAlign: 'center', padding: 20 },
  erro: { color: '#B91C1C', marginBottom: 10, fontSize: 13 },
  tentar: { paddingVertical: 12, alignItems: 'center' },
  textoTentar: { color: '#263F78', fontWeight: '600' },
});
