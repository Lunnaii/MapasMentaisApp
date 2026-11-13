import { useCallback, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ItemMapa from '../components/ItemMapa';
import CamadaConexoes from '../components/CamadaConexoes';
import PainelEstilo from '../components/PainelEstilo';
import ListaConexoes from '../components/ListaConexoes';
import { escolherImagem } from '../services/imagens';
import { normalizarGeometria, obterGeometriaItem, obterTamanhoFolha } from '../utils/mapaLayout';

const ferramentas = [
  { id: 'texto', titulo: 'Texto', icone: 'text-outline', cor: '#5B6EF5' },
  { id: 'ideia', titulo: 'Ideia', icone: 'ellipse-outline', cor: '#A855F7' },
  { id: 'retangulo', titulo: 'Caixa', icone: 'square-outline', cor: '#0EA5A4' },
  { id: 'imagem', titulo: 'Imagem', icone: 'image-outline', cor: '#F59E0B' },
  { id: 'conexao', titulo: 'Conexão', icone: 'git-branch-outline', cor: '#64748B' },
];

export default function EditorMapaScreen({ mapaInicial, onVoltar, onSalvar }) {
  const [area] = useState(() => obterTamanhoFolha(mapaInicial));
  const [itens, setItens] = useState(mapaInicial?.itens || [{
    id: 'centro', tipo: 'ideia', texto: 'Ideia central', x: 0.5, y: 0.48,
    largura: Math.min(180, area.width * 0.6) / area.width,
    altura: Math.min(80, Math.max(48, area.height * 0.2)) / area.height,
    tamanhoFonte: area.width < 200 ? 12 : 14,
  }]);
  const [conexoes, setConexoes] = useState(mapaInicial?.conexoes || []);
  const [conexaoSelecionada, setConexaoSelecionada] = useState(null);
  const [painelEstiloAberto, setPainelEstiloAberto] = useState(false);
  const [listaConexoesAberta, setListaConexoesAberta] = useState(false);
  const [modoConexao, setModoConexao] = useState(false);
  const [origemConexao, setOrigemConexao] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [titulo, setTitulo] = useState(mapaInicial?.titulo || 'Novo mapa mental');
  const [salvando, setSalvando] = useState(false);
  const [menuVisivel, setMenuVisivel] = useState(true);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(null);
  const [previaMovimento, setPreviaMovimento] = useState(null);
  const [escolhendoImagem, setEscolhendoImagem] = useState(false);
  const sequenciaItens = useRef(0);
  const itemSelecionado = itens.find((item) => item.id === selecionado);
  const conexaoAtual = conexoes.find((conexao) => conexao.id === conexaoSelecionada);
  const folhaPronta = viewport.width > 40 && viewport.height > 40;
  const escalaAjustada = Math.max(0.05, Math.min((viewport.width - 32) / area.width, (viewport.height - 32) / area.height, 2));
  const escala = zoom || escalaAjustada;

  const atualizarItem = useCallback((id, alteracoes) => {
    setItens((atuais) => atuais.map((item) => item.id === id ? { ...item, ...alteracoes } : item));
  }, []);

  const informarPrevia = useCallback((id, geometria) => {
    setPreviaMovimento(geometria ? { id, geometria } : null);
  }, []);

  const selecionarItem = useCallback((id) => {
    setSelecionado(id);
    setConexaoSelecionada(null);
    if (!modoConexao) return;
    if (!origemConexao) {
      setOrigemConexao(id);
      return;
    }
    if (origemConexao === id) return;
    const existente = conexoes.find((conexao) => (conexao.origem === origemConexao && conexao.destino === id) ||
      (conexao.origem === id && conexao.destino === origemConexao));
    const idConexao = existente?.id || `conexao-${origemConexao}-${id}`;
    setConexoes((atuais) => {
      if (atuais.some((conexao) => (conexao.origem === origemConexao && conexao.destino === id) ||
        (conexao.origem === id && conexao.destino === origemConexao))) return atuais;
      return [...atuais, { id: idConexao, origem: origemConexao, destino: id }];
    });
    setModoConexao(false);
    setOrigemConexao(null);
    setSelecionado(null);
    setConexaoSelecionada(idConexao);
    setPainelEstiloAberto(true);
  }, [modoConexao, origemConexao, conexoes]);

  const selecionarConexao = useCallback((id) => {
    Keyboard.dismiss();
    setSelecionado(null);
    setModoConexao(false);
    setOrigemConexao(null);
    setConexaoSelecionada(id);
    setPainelEstiloAberto(true);
  }, []);

  function removerSelecao() {
    Keyboard.dismiss();
    if (itemSelecionado) {
      setItens((atuais) => atuais.filter((item) => item.id !== selecionado));
      setConexoes((atuais) => atuais.filter((conexao) => conexao.origem !== selecionado && conexao.destino !== selecionado));
    } else if (conexaoAtual) {
      setConexoes((atuais) => atuais.filter((conexao) => conexao.id !== conexaoSelecionada));
    }
    setSelecionado(null);
    setConexaoSelecionada(null);
    setPainelEstiloAberto(false);
  }

  async function salvar() {
    Keyboard.dismiss();
    setSalvando(true);
    try {
      await onSalvar({
        id: mapaInicial?.id || `mapa-${Date.now()}`,
        titulo: titulo.trim() || 'Mapa sem título',
        itens: itens.map((item) => ({ ...item, ...normalizarGeometria(obterGeometriaItem(item, area), area) })),
        tamanhoFolha: area,
        conexoes,
        criadoEm: mapaInicial?.criadoEm || new Date().toISOString(),
      });
    } catch {
      Alert.alert('Não foi possível salvar', 'Confira o espaço disponível no aparelho e tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarItem(tipo) {
    Keyboard.dismiss();
    setConexaoSelecionada(null);
    if (tipo === 'conexao') {
      setModoConexao((ativo) => !ativo);
      setOrigemConexao(null);
      setSelecionado(null);
      return;
    }
    setModoConexao(false);
    setOrigemConexao(null);
    let imagem = null;
    if (tipo === 'imagem') {
      setEscolhendoImagem(true);
      try {
        imagem = await escolherImagem();
        if (!imagem) return;
      } catch {
        Alert.alert('Não foi possível inserir a imagem', 'Escolha uma imagem da galeria e tente novamente.');
        return;
      } finally {
        setEscolhendoImagem(false);
      }
    }
    let id;
    do {
      sequenciaItens.current += 1;
      id = `${tipo}-${sequenciaItens.current}`;
    } while (itens.some((item) => item.id === id));
    const indice = itens.length;
    const novo = {
      id,
      tipo,
      texto: tipo === 'texto' ? 'Novo texto' : tipo === 'retangulo' ? 'Novo tópico' : 'Nova ideia',
      x: 0.3 + (indice % 3) * 0.14,
      y: 0.25 + (indice % 5) * 0.12,
      largura: Math.min(160, area.width * 0.42) / area.width,
      altura: Math.min(80, Math.max(48, area.height * 0.16)) / area.height,
      tamanhoFonte: area.width < 200 ? 12 : 14,
      ...imagem,
    };
    if (imagem) {
      const largura = Math.min(area.width * 0.5, 240);
      const altura = Math.min(largura / imagem.proporcaoImagem, area.height * 0.5);
      novo.largura = Math.min(largura, altura * imagem.proporcaoImagem) / area.width;
      novo.altura = altura / area.height;
    }
    setItens((atuais) => [...atuais, novo]);
    setSelecionado(novo.id);
  }

  function ajustarFonte(incremento) {
    if (!itemSelecionado) return;
    atualizarItem(itemSelecionado.id, {
      tamanhoFonte: Math.min(96, Math.max(6, (itemSelecionado.tamanhoFonte || 14) + incremento)),
    });
  }

  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.cabecalho}>
        <Pressable style={styles.botaoCabecalho} onPress={onVoltar} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color="#334155" />
        </Pressable>
        <TextInput style={styles.titulo} value={titulo} onChangeText={setTitulo} selectTextOnFocus accessibilityLabel="Nome do mapa mental" />
        <Pressable style={styles.botaoCabecalho} onPress={() => { Keyboard.dismiss(); setMenuVisivel((visivel) => !visivel); }} accessibilityRole="button" accessibilityLabel={menuVisivel ? 'Ocultar ferramentas' : 'Exibir ferramentas'} accessibilityState={{ expanded: menuVisivel }}>
          <Ionicons name={menuVisivel ? 'chevron-forward-outline' : 'options-outline'} size={22} color="#5B6EF5" />
        </Pressable>
        <Pressable style={[styles.botaoCabecalho, styles.salvar]} onPress={salvar} disabled={salvando || !folhaPronta} accessibilityRole="button" accessibilityLabel="Salvar mapa">
          <Ionicons name={salvando ? 'hourglass-outline' : 'save-outline'} size={21} color="#5B6EF5" />
        </Pressable>
      </View>

      <View style={styles.instrucoes}>
        <Text style={styles.dica}>
          {modoConexao ? (origemConexao ? 'Agora toque no segundo item para conectar.' : 'Toque no primeiro item da conexão.') :
            conexaoAtual ? 'Conexão selecionada. Toque em Estilo para personalizar.' :
            itemSelecionado ? 'Arraste as alças ou toque em Estilo para personalizar.' : 'Toque em um item ou em uma conexão para editar.'}
        </Text>
        {(itemSelecionado || conexaoAtual) && !modoConexao && (
          <View style={styles.controleFonte}>
            {itemSelecionado && itemSelecionado.tipo !== 'imagem' && <>
            <Pressable style={styles.botaoFonte} onPress={() => ajustarFonte(-2)} disabled={(itemSelecionado.tamanhoFonte || 14) <= 6} accessibilityRole="button" accessibilityLabel="Diminuir tamanho do texto">
              <Ionicons name="remove" size={18} color="#5B6EF5" />
            </Pressable>
            <Text style={styles.tamanhoFonte}>{itemSelecionado.tamanhoFonte || 14}</Text>
            <Pressable style={styles.botaoFonte} onPress={() => ajustarFonte(2)} disabled={(itemSelecionado.tamanhoFonte || 14) >= 96} accessibilityRole="button" accessibilityLabel="Aumentar tamanho do texto">
              <Ionicons name="add" size={18} color="#5B6EF5" />
            </Pressable>
            </>}
            <Pressable style={styles.botaoEstilo} onPress={() => { Keyboard.dismiss(); setPainelEstiloAberto(true); }} accessibilityRole="button" accessibilityLabel="Editar estilo">
              <Ionicons name="options-outline" size={18} color="#5B6EF5" /><Text style={styles.textoAjustar}>Estilo</Text>
            </Pressable>
            <Pressable style={styles.botaoFonte} onPress={removerSelecao} accessibilityRole="button" accessibilityLabel="Remover elemento selecionado">
              <Ionicons name="trash-outline" size={18} color="#B91C1C" />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.barraZoom}>
        <Text style={styles.dimensoes}>{area.width} × {area.height} px</Text>
        <Pressable style={styles.botaoZoom} onPress={() => setZoom(Math.max(0.05, escala / 1.25))} accessibilityRole="button" accessibilityLabel="Diminuir zoom"><Ionicons name="remove" size={18} color="#5B6EF5" /></Pressable>
        <Text style={styles.percentual}>{Math.round(escala * 100)}%</Text>
        <Pressable style={styles.botaoZoom} onPress={() => setZoom(Math.min(4, escala * 1.25))} accessibilityRole="button" accessibilityLabel="Aumentar zoom"><Ionicons name="add" size={18} color="#5B6EF5" /></Pressable>
        <Pressable style={styles.ajustarZoom} onPress={() => setZoom(null)} accessibilityRole="button" accessibilityLabel="Ajustar folha à tela"><Text style={styles.textoAjustar}>Ajustar</Text></Pressable>
      </View>

      <View style={styles.folhaArea} onLayout={({ nativeEvent: { layout } }) => {
        setViewport((atual) => atual.width === layout.width && atual.height === layout.height ? atual : { width: layout.width, height: layout.height });
      }}>
        <ScrollView horizontal nestedScrollEnabled scrollEnabled={!previaMovimento} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.rolagemHorizontal}>
          <ScrollView nestedScrollEnabled scrollEnabled={!previaMovimento} keyboardShouldPersistTaps="handled" style={{ width: Math.max(viewport.width, area.width * escala + 32) }} contentContainerStyle={[styles.rolagemVertical, { minHeight: viewport.height }]}>
            <View style={{ width: area.width * escala, height: area.height * escala }}>
              <View style={[styles.folha, { width: area.width, height: area.height, transform: [{ scale: escala }] }]}>
                <Pressable style={StyleSheet.absoluteFillObject} onPress={() => { Keyboard.dismiss(); setSelecionado(null); setConexaoSelecionada(null); }} accessibilityLabel="Área em branco do mapa" />
                <CamadaConexoes itens={itens} conexoes={conexoes} area={area} previa={previaMovimento} escala={escala} selecionada={conexaoSelecionada} onSelecionar={selecionarConexao} modoConexao={modoConexao} />
                {folhaPronta && itens.map((item) => (
                  <ItemMapa key={item.id} item={item} area={area} escala={escala} modoConexao={modoConexao} ativo={selecionado === item.id} onSelecionar={selecionarItem} onAtualizar={atualizarItem} onPrevia={informarPrevia} />
                ))}
              </View>
            </View>
          </ScrollView>
        </ScrollView>

        {menuVisivel && (
          <View style={styles.menuLateral}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.listaFerramentas}>
              <Text style={styles.rotuloFerramentas}>INSERIR</Text>
              {ferramentas.map((ferramenta) => (
                <Pressable key={ferramenta.id} style={[styles.ferramenta, ferramenta.id === 'conexao' && modoConexao && styles.ferramentaAtiva]} disabled={escolhendoImagem} onPress={() => adicionarItem(ferramenta.id)} accessibilityRole="button" accessibilityLabel={`Inserir ${ferramenta.titulo}`} accessibilityState={{ selected: ferramenta.id === 'conexao' && modoConexao }}>
                  <View style={[styles.iconeFerramenta, { backgroundColor: `${ferramenta.cor}18` }]}>
                    <Ionicons name={ferramenta.icone} size={21} color={ferramenta.cor} />
                  </View>
                  <Text style={styles.nomeFerramenta}>{ferramenta.id === 'imagem' && escolhendoImagem ? 'Abrindo…' : ferramenta.titulo}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.ocultarMenu} onPress={() => { Keyboard.dismiss(); setListaConexoesAberta(true); }} accessibilityRole="button" accessibilityLabel="Listar e editar conexões">
                <Ionicons name="list-outline" size={18} color="#5B6EF5" /><Text style={styles.nomeFerramenta}>Ligações ({conexoes.length})</Text>
              </Pressable>
              <Pressable style={styles.ocultarMenu} onPress={() => setMenuVisivel(false)} accessibilityRole="button" accessibilityLabel="Ocultar ferramentas">
                <Ionicons name="chevron-forward-outline" size={18} color="#64748B" />
                <Text style={styles.nomeFerramenta}>Ocultar</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}
      </View>
      {painelEstiloAberto && (itemSelecionado || conexaoAtual) && <PainelEstilo
        key={itemSelecionado?.id || conexaoAtual.id}
        alvo={itemSelecionado || conexaoAtual}
        conexao={!!conexaoAtual}
        onAlterar={(alteracoes) => {
          if (itemSelecionado) atualizarItem(itemSelecionado.id, alteracoes);
          else setConexoes((atuais) => atuais.map((conexao) => conexao.id === conexaoSelecionada ? { ...conexao, ...alteracoes } : conexao));
        }}
        onExcluir={removerSelecao}
        onFechar={() => setPainelEstiloAberto(false)}
      />}
      {listaConexoesAberta && <ListaConexoes itens={itens} conexoes={conexoes} onFechar={() => setListaConexoesAberta(false)} onSelecionar={(id) => { setListaConexoesAberta(false); selecionarConexao(id); }} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F3F5FA' },
  cabecalho: { minHeight: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 6 },
  botaoCabecalho: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  titulo: { flex: 1, minWidth: 60, color: '#1E293B', fontSize: 15, fontWeight: '700', paddingVertical: 8 },
  salvar: { backgroundColor: '#E8ECFF' },
  instrucoes: { height: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dica: { flex: 1, color: '#64748B', fontSize: 11, lineHeight: 16 },
  controleFonte: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12 },
  botaoFonte: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  botaoEstilo: { minWidth: 44, height: 44, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  tamanhoFonte: { color: '#475569', fontSize: 12, minWidth: 18, textAlign: 'center' },
  folhaArea: { flex: 1 },
  folha: { position: 'absolute', left: 0, top: 0, backgroundColor: '#FFF', overflow: 'hidden', transformOrigin: 'left top' },
  rolagemHorizontal: { flexGrow: 1 },
  rolagemVertical: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  barraZoom: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 4, minHeight: 44 },
  dimensoes: { flex: 1, color: '#64748B', fontSize: 11, fontWeight: '600' },
  botaoZoom: { width: 34, height: 44, alignItems: 'center', justifyContent: 'center' },
  percentual: { minWidth: 34, textAlign: 'center', color: '#475569', fontSize: 11 },
  ajustarZoom: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 },
  textoAjustar: { color: '#5B6EF5', fontSize: 11, fontWeight: '600' },
  menuLateral: { position: 'absolute', top: 12, right: 20, width: 76, maxHeight: '94%', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, elevation: 5, shadowColor: '#334155', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 3 } },
  listaFerramentas: { alignItems: 'center', paddingVertical: 12, gap: 10 },
  rotuloFerramentas: { color: '#94A3B8', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  ferramenta: { minWidth: 64, minHeight: 60, alignItems: 'center', justifyContent: 'center' },
  ferramentaAtiva: { backgroundColor: '#E8ECFF', borderRadius: 12 },
  iconeFerramenta: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nomeFerramenta: { marginTop: 4, color: '#475569', fontSize: 10, fontWeight: '600' },
  ocultarMenu: { width: 60, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 2, paddingTop: 8 },
});
