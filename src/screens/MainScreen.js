import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../services/firebase';
import styles from '../styles/styles';
import UserInfoScreen from './UserInfoScreen';
import EditorMapaScreen from './EditorMapaScreen';
import NovoMapaModal from '../components/NovoMapaModal';
import ConfirmarExclusaoMapa from '../components/ConfirmarExclusaoMapa';
import CompartilharMapaModal from '../components/CompartilharMapaModal';
import { listarMapas, salvarMapa, excluirMapa } from '../services/mapas';

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const [painelMontado, setPainelMontado] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);
  const [editorAberto, setEditorAberto] = useState(false);
  const [novoMapaVisivel, setNovoMapaVisivel] = useState(false);
  const [mapaEditando, setMapaEditando] = useState(null);
  const [mapas, setMapas] = useState([]);
  const [mapaExcluindo, setMapaExcluindo] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');
  const [erroLeitura, setErroLeitura] = useState(false);
  const [compartilharVisivel, setCompartilharVisivel] = useState(false);
  const [mapaCompartilhandoId, setMapaCompartilhandoId] = useState(null);
  const [deslocamento] = useState(() => new Animated.Value(-1000));

  useEffect(() => {
    listarMapas().then(setMapas).catch(() => setErroLeitura(true));
  }, []);

  async function confirmarExclusao() {
    if (!mapaExcluindo || excluindo) return;
    setExcluindo(true);
    setErroExclusao('');
    try {
      setMapas(await excluirMapa(mapaExcluindo.id));
      setMapaExcluindo(null);
    } catch {
      setErroExclusao('Não foi possível apagar. Tente novamente.');
    } finally {
      setExcluindo(false);
    }
  }

  useEffect(() => {
    if (!painelMontado) return;

    Animated.timing(deslocamento, {
      toValue: painelAberto ? 0 : -1000,
      duration: 240,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !painelAberto) setPainelMontado(false);
    });
  }, [deslocamento, painelAberto, painelMontado]);

  function abrirPainel() {
    setPainelMontado(true);
    setPainelAberto(true);
  }

  function fecharPainel() {
    setPainelAberto(false);
  }

  if (editorAberto) {
    return (
      <EditorMapaScreen
        mapaInicial={mapaEditando}
        onVoltar={() => setEditorAberto(false)}
        onSalvar={async (mapa) => {
          const salvos = await salvarMapa(mapa);
          setMapas(salvos);
          setErroLeitura(false);
          setEditorAberto(false);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.conteudoInicio} showsVerticalScrollIndicator={false}>
      <View style={styles.inicioCabecalho}>
        <View>
          <Text style={styles.inicioSaudacao}>Seu espaço criativo</Text>
          <Text style={styles.texto}>Olá, {auth.currentUser?.displayName || 'vamos criar?'}</Text>
        </View>
        <View style={styles.marcaInicio}><Ionicons name="bulb-outline" size={22} color="#5B6EF5" /></View>
      </View>
      <View style={styles.cartaoDestaque}>
        <View style={styles.ilustracaoDestaque}>
          <Ionicons name="git-network-outline" size={42} color="#5B6EF5" />
          <View style={styles.pontoDestaque}><Ionicons name="add" size={16} color="#FFF" /></View>
        </View>
        <Text style={styles.tituloDestaque}>Tire suas ideias da cabeça</Text>
        <Text style={styles.descricaoDestaque}>Organize pensamentos e crie conexões em um mapa visual.</Text>
        <Pressable style={styles.botaoCriarMapa} onPress={() => setNovoMapaVisivel(true)} accessibilityRole="button">
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.textoCriarMapa}>Criar mapa mental</Text>
        </Pressable>
      </View>
      <Text style={styles.tituloSecao}>Comece por aqui</Text>
      <View style={styles.cartaoDica}>
        <View style={styles.iconeDica}><Ionicons name="sparkles-outline" size={20} color="#D97706" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tituloDica}>Uma ideia de cada vez</Text>
          <Text style={styles.textoDica}>Adicione tópicos e conecte conceitos para dar forma ao seu mapa.</Text>
        </View>
      </View>

      <View style={styles.tituloMapasLinha}>
        <Text style={styles.tituloSecao}>Meus mapas</Text>
        <Text style={styles.contagemMapas}>{mapas.length}</Text>
        <Pressable style={[styles.acaoMapa, { marginLeft: 'auto' }]} disabled={mapas.length === 0 || erroLeitura} onPress={() => { setMapaCompartilhandoId(null); setCompartilharVisivel(true); }} accessibilityRole="button" accessibilityLabel="Selecionar mapa para compartilhar">
          <Ionicons name="share-outline" size={18} color="#5B6EF5" /><Text style={styles.textoAcaoMapa}>Compartilhar</Text>
        </Pressable>
      </View>
      {erroLeitura ? <View style={styles.estadoVazio}>
        <Text style={styles.textoVazio}>Não foi possível carregar os mapas salvos.</Text>
        <Pressable onPress={async () => {
          try { setMapas(await listarMapas()); setErroLeitura(false); } catch { setErroLeitura(true); }
        }} accessibilityRole="button"><Text style={styles.textoAcaoMapa}>Tentar novamente</Text></Pressable>
      </View> : mapas.length === 0 ? (
        <View style={styles.estadoVazio}>
          <Ionicons name="documents-outline" size={26} color="#9AA7BC" />
          <Text style={styles.textoVazio}>Seus mapas salvos aparecerão aqui.</Text>
        </View>
      ) : mapas.map((mapa) => (
        <View key={mapa.id} style={styles.cartaoMapa}>
          <Pressable style={styles.detalheMapa} onPress={() => { setMapaEditando(mapa); setEditorAberto(true); }} accessibilityRole="button" accessibilityLabel={`Editar ${mapa.titulo}`}>
            <View style={styles.miniaturaMapa}><Ionicons name="git-network-outline" size={22} color="#5B6EF5" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nomeMapa} numberOfLines={1}>{mapa.titulo}</Text>
              <Text style={styles.subtituloMapa}>{mapa.itens?.length || 0} itens · atualizado {new Date(mapa.atualizadoEm || mapa.criadoEm).toLocaleDateString('pt-BR')}</Text>
            </View>
          </Pressable>
          <View style={styles.acoesMapa}>
            <Pressable style={styles.acaoMapa} onPress={() => { setErroExclusao(''); setMapaExcluindo(mapa); }} accessibilityRole="button" accessibilityLabel={`Apagar mapa ${mapa.titulo}`}>
              <Ionicons name="trash-outline" size={18} color="#B91C1C" /><Text style={[styles.textoAcaoMapa, { color: '#B91C1C' }]}>Apagar</Text>
            </Pressable>
            <Pressable style={styles.acaoMapa} onPress={() => { setMapaEditando(mapa); setEditorAberto(true); }} accessibilityRole="button" accessibilityLabel="Editar mapa">
              <Ionicons name="create-outline" size={18} color="#5B6EF5" /><Text style={styles.textoAcaoMapa}>Editar</Text>
            </Pressable>
            <Pressable style={styles.acaoMapa} onPress={() => { setMapaCompartilhandoId(mapa.id); setCompartilharVisivel(true); }} accessibilityRole="button" accessibilityLabel={`Compartilhar ${mapa.titulo} como PDF ou imagem`}>
              <Ionicons name="share-outline" size={18} color="#0F9B8E" /><Text style={styles.textoAcaoMapa}>Compartilhar</Text>
            </Pressable>
          </View>
        </View>
      ))}
      </ScrollView>

      {compartilharVisivel && <CompartilharMapaModal mapas={mapas} mapaInicialId={mapaCompartilhandoId} onFechar={() => setCompartilharVisivel(false)} />}

      {mapaExcluindo && <ConfirmarExclusaoMapa mapa={mapaExcluindo} ocupado={excluindo} erro={erroExclusao} onCancelar={() => setMapaExcluindo(null)} onConfirmar={confirmarExclusao} />}

      {novoMapaVisivel && <NovoMapaModal onCancelar={() => setNovoMapaVisivel(false)} onCriar={(mapa) => {
        setMapaEditando(mapa);
        setNovoMapaVisivel(false);
        setEditorAberto(true);
      }} />}

      <Pressable
        style={[styles.botaoConta, { bottom: insets.bottom + 16 }]}
        onPress={abrirPainel}
        accessibilityRole="button"
        accessibilityLabel="Abrir informações do usuário"
      >
        <View style={styles.iconeConta}>
          <Ionicons name="person" size={24} color="#608ff4" />
        </View>
        <Text style={styles.textoBotaoConta}>Conta</Text>
      </Pressable>

      <Modal
        visible={painelMontado}
        transparent
        animationType="none"
        onRequestClose={fecharPainel}
      >
        <View style={styles.fundoPainel}>
          <Pressable
            style={styles.sobreposicaoPainel}
            onPress={fecharPainel}
            accessibilityRole="button"
            accessibilityLabel="Fechar informações do usuário"
          />
          <Animated.View
            style={[styles.painelConta, { transform: [{ translateY: deslocamento }] }]}
          >
            <SafeAreaView edges={['top', 'left', 'right']}>
              <UserInfoScreen onClose={fecharPainel} />
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
