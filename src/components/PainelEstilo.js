import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTES, obterEstiloConexao, obterEstiloItem, obterFamiliaFonte } from '../utils/mapaEstilos';

const TRACOS = [{ valor: 'solida', nome: 'Contínua' }, { valor: 'tracejada', nome: 'Tracejada' }, { valor: 'pontilhada', nome: 'Pontilhada' }];
const CORES = ['#26324B', '#64748B', '#FFFFFF', '#263F78', '#9333EA', '#DB2777', '#DC2626', '#EA580C', '#F59E0B', '#15803D', '#0D9488', '#EEF1F7', '#E6FAF7', '#FEF3C7'];

function Escolha({ titulo, valor, opcoes, onChange }) {
  return <View style={styles.secao}>
    <Text style={styles.rotulo}>{titulo}</Text>
    <View style={styles.opcoes}>{opcoes.map((opcao) => {
      const id = opcao.valor ?? opcao;
      const nome = opcao.nome ?? String(opcao);
      return <Pressable key={id} style={[styles.opcao, valor === id && styles.opcaoAtiva]} onPress={() => onChange(id)} accessibilityRole="button" accessibilityState={{ selected: valor === id }} accessibilityLabel={`${titulo}: ${nome}`}>
        <Text style={[styles.textoOpcao, opcao.fonte && { fontFamily: obterFamiliaFonte(opcao.fonte, Platform.OS) }]}>{nome}</Text>
      </Pressable>;
    })}</View>
  </View>;
}

function Numero({ titulo, valor, minimo, maximo, onChange }) {
  const [rascunho, setRascunho] = useState(null);
  function aplicar() {
    const numero = Number(rascunho);
    if (rascunho?.trim() && Number.isFinite(numero)) onChange(Math.min(maximo, Math.max(minimo, Math.round(numero))));
    setRascunho(null);
  }
  return <View style={styles.secao}>
    <Text style={styles.rotulo}>{titulo}</Text>
    <View style={styles.numeroLinha}>
      <Pressable style={styles.passo} onPress={() => { setRascunho(null); onChange(Math.max(minimo, valor - 1)); }} accessibilityLabel={`Diminuir ${titulo}`} accessibilityRole="button"><Ionicons name="remove" size={20} color="#263F78" /></Pressable>
      <TextInput style={styles.numero} value={rascunho ?? String(valor)} onChangeText={setRascunho} keyboardType="number-pad" selectTextOnFocus onBlur={aplicar} onSubmitEditing={aplicar} accessibilityLabel={titulo} />
      <Pressable style={styles.passo} onPress={() => { setRascunho(null); onChange(Math.min(maximo, valor + 1)); }} accessibilityLabel={`Aumentar ${titulo}`} accessibilityRole="button"><Ionicons name="add" size={20} color="#263F78" /></Pressable>
    </View>
  </View>;
}

function Cores({ titulo, valor, onChange, transparente = false }) {
  const [rascunho, setRascunho] = useState(null);
  const [erro, setErro] = useState('');
  function aplicar() {
    const cor = (rascunho ?? valor).trim();
    if (!/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(cor)) {
      setErro('Use uma cor hexadecimal, por exemplo #263F78.');
      return;
    }
    onChange(cor.toUpperCase());
    setRascunho(null);
    setErro('');
  }
  return <View style={styles.secao}>
    <Text style={styles.rotulo}>{titulo}</Text>
    <View style={styles.opcoes}>{(transparente ? ['transparent', ...CORES] : CORES).map((cor) => <Pressable key={cor} style={[styles.cor, { backgroundColor: cor === 'transparent' ? '#F8FAFC' : cor }, valor.toLowerCase() === cor.toLowerCase() && styles.corAtiva]} onPress={() => { onChange(cor); setRascunho(null); setErro(''); }} accessibilityRole="button" accessibilityLabel={`${titulo}: ${cor === 'transparent' ? 'Transparente' : cor}`} accessibilityState={{ selected: valor.toLowerCase() === cor.toLowerCase() }}>
      {cor === 'transparent' && <Ionicons name="close" size={20} color="#64748B" />}
    </Pressable>)}</View>
    <View style={styles.corPersonalizada}>
      <TextInput style={styles.hex} value={rascunho ?? (valor === 'transparent' ? '' : valor)} onChangeText={setRascunho} placeholder="#RRGGBB" autoCapitalize="characters" maxLength={7} onSubmitEditing={aplicar} accessibilityLabel={`Cor personalizada: ${titulo}`} />
      <Pressable style={styles.aplicar} onPress={aplicar} accessibilityRole="button"><Text style={styles.textoOpcao}>Aplicar cor</Text></Pressable>
    </View>
    {!!erro && <Text style={styles.erro}>{erro}</Text>}
  </View>;
}

export default function PainelEstilo({ alvo, conexao = false, onAlterar, onExcluir, onFechar }) {
  const estilo = conexao ? obterEstiloConexao(alvo) : obterEstiloItem(alvo);
  const alterarEstilo = (alteracoes) => onAlterar({ estilo: { ...alvo.estilo, ...alteracoes } });
  return <Modal transparent animationType="slide" onRequestClose={onFechar}>
    <View style={styles.fundo}>
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onFechar} accessibilityLabel="Fechar estilos" />
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.painel}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>{conexao ? 'Estilo da conexão' : alvo.tipo === 'imagem' ? 'Estilo da imagem' : 'Texto e caixa'}</Text>
          <Pressable style={styles.passo} onPress={onFechar} accessibilityLabel="Fechar estilos" accessibilityRole="button"><Ionicons name="close" size={23} color="#475569" /></Pressable>
        </View>
        <ScrollView style={styles.rolagem} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.conteudo}>
          {conexao ? <>
            <Escolha titulo="Caminho" valor={estilo.caminho} opcoes={[{ valor: 'reta', nome: 'Reto' }, { valor: 'curva', nome: 'Curvo' }, { valor: 'cotovelo', nome: 'Em ângulo' }]} onChange={(caminho) => alterarEstilo({ caminho })} />
            <Escolha titulo="Traçado" valor={estilo.traco} opcoes={TRACOS} onChange={(traco) => alterarEstilo({ traco })} />
            <Escolha titulo="Setas" valor={estilo.seta} opcoes={[{ valor: 'nenhuma', nome: 'Sem seta' }, { valor: 'fim', nome: 'No destino' }, { valor: 'ambas', nome: 'Nas duas pontas' }]} onChange={(seta) => alterarEstilo({ seta })} />
            <Numero titulo="Espessura da linha" valor={estilo.espessura} minimo={1} maximo={12} onChange={(espessura) => alterarEstilo({ espessura })} />
            <Cores titulo="Cor da conexão" valor={estilo.cor} onChange={(cor) => alterarEstilo({ cor })} />
          </> : <>
            {alvo.tipo !== 'imagem' && <>
              <Escolha titulo="Fonte" valor={estilo.fonte} opcoes={FONTES.map((fonte) => ({ valor: fonte.id, nome: fonte.nome, fonte: fonte.id }))} onChange={(fonte) => alterarEstilo({ fonte })} />
              <Numero titulo="Tamanho do texto (px)" valor={alvo.tamanhoFonte || 14} minimo={6} maximo={96} onChange={(tamanhoFonte) => onAlterar({ tamanhoFonte })} />
              <View style={styles.opcoes}>{[{ campo: 'negrito', nome: 'Negrito' }, { campo: 'italico', nome: 'Itálico' }, { campo: 'sublinhado', nome: 'Sublinhado' }].map(({ campo, nome }) => <Pressable key={campo} style={[styles.opcao, estilo[campo] && styles.opcaoAtiva]} onPress={() => alterarEstilo({ [campo]: !estilo[campo] })} accessibilityRole="button" accessibilityState={{ selected: estilo[campo] }}><Text style={styles.textoOpcao}>{nome}</Text></Pressable>)}</View>
              <Escolha titulo="Alinhamento" valor={estilo.alinhamento} opcoes={[{ valor: 'left', nome: 'Esquerda' }, { valor: 'center', nome: 'Centro' }, { valor: 'right', nome: 'Direita' }]} onChange={(alinhamento) => alterarEstilo({ alinhamento })} />
              <Escolha titulo="Espaçamento entre linhas" valor={estilo.entrelinha} opcoes={[1, 1.25, 1.5, 2]} onChange={(entrelinha) => alterarEstilo({ entrelinha })} />
              <Cores titulo="Cor do texto" valor={estilo.corTexto} onChange={(corTexto) => alterarEstilo({ corTexto })} />
            </>}
            <Text style={styles.subtitulo}>Aparência da caixa</Text>
            <Escolha titulo="Cantos" valor={estilo.raio} opcoes={[{ valor: 0, nome: 'Retos' }, { valor: 12, nome: 'Arredondados' }, { valor: 999, nome: 'Cápsula' }]} onChange={(raio) => alterarEstilo({ raio })} />
            <Escolha titulo="Espessura da borda" valor={estilo.espessuraBorda} opcoes={[0, 1, 2, 4, 6]} onChange={(espessuraBorda) => alterarEstilo({ espessuraBorda })} />
            <Escolha titulo="Traçado da borda" valor={estilo.tracoBorda} opcoes={TRACOS} onChange={(tracoBorda) => alterarEstilo({ tracoBorda })} />
            <Cores titulo="Preenchimento" valor={estilo.fundo} transparente onChange={(fundo) => alterarEstilo({ fundo })} />
            <Cores titulo="Cor da borda" valor={estilo.corBorda} transparente onChange={(corBorda) => alterarEstilo({ corBorda })} />
          </>}
          <Pressable style={styles.restaurar} onPress={() => onAlterar({ estilo: {}, ...(!conexao ? { tamanhoFonte: 14 } : {}) })} accessibilityRole="button"><Text style={styles.textoOpcao}>Restaurar estilo padrão</Text></Pressable>
          <Pressable style={styles.excluir} onPress={onExcluir} accessibilityRole="button"><Ionicons name="trash-outline" size={18} color="#B91C1C" /><Text style={styles.textoExcluir}>{conexao ? 'Apagar conexão' : 'Apagar item'}</Text></Pressable>
        </ScrollView>
        <Pressable style={styles.concluir} onPress={onFechar} accessibilityRole="button"><Text style={styles.textoConcluir}>Concluir</Text></Pressable>
      </SafeAreaView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.32)' },
  painel: { height: '86%', width: '100%', maxWidth: 640, alignSelf: 'center', backgroundColor: '#FFF', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  rolagem: { flex: 1 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  titulo: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  conteudo: { padding: 20, paddingBottom: 12 },
  secao: { marginBottom: 22 },
  rotulo: { color: '#475569', fontWeight: '600', fontSize: 13, marginBottom: 10 },
  subtitulo: { color: '#1E293B', fontSize: 16, fontWeight: '700', marginVertical: 12 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: { paddingHorizontal: 13, minHeight: 44, justifyContent: 'center', backgroundColor: '#F1F5F9', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  opcaoAtiva: { backgroundColor: '#EEF1F7', borderColor: '#263F78' },
  textoOpcao: { color: '#334155', fontSize: 12, fontWeight: '500' },
  numeroLinha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  passo: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  numero: { width: 72, height: 44, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, textAlign: 'center', color: '#1E293B', fontSize: 16 },
  cor: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  corAtiva: { borderWidth: 3, borderColor: '#111827' },
  corPersonalizada: { flexDirection: 'row', gap: 10, marginTop: 12 },
  hex: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, minHeight: 44, color: '#334155' },
  aplicar: { backgroundColor: '#EEF1F7', padding: 12, borderRadius: 10, justifyContent: 'center' },
  erro: { color: '#B91C1C', fontSize: 12, marginTop: 8 },
  restaurar: { paddingVertical: 14, alignItems: 'center' },
  excluir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: '#FEF2F2', borderRadius: 12, marginTop: 8 },
  textoExcluir: { color: '#B91C1C', fontWeight: '600' },
  concluir: { backgroundColor: '#263F78', padding: 15, alignItems: 'center', borderRadius: 12, margin: 16 },
  textoConcluir: { color: '#FFF', fontWeight: '700' },
});
