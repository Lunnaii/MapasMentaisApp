import { memo, useMemo, useRef, useState } from 'react';
import { Image, Keyboard, PanResponder, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moverGeometria, normalizarGeometria, obterGeometriaItem, redimensionarGeometria } from '../utils/mapaLayout';
import { obterEstiloItem, obterFamiliaFonte } from '../utils/mapaEstilos';

function ItemMapa({ item, area, ativo, onSelecionar, onAtualizar, onPrevia, escala = 1, modoConexao = false }) {
  const [previa, setPrevia] = useState(null);
  const [imagemErro, setImagemErro] = useState(false);
  const gesto = useRef(null);
  const editando = useRef(false);

  /* eslint-disable react-hooks/refs -- PanResponder registra callbacks; as refs só são acessadas durante os gestos. */
  const controles = useMemo(() => {
    function concluir() {
      if (gesto.current) {
        onAtualizar(item.id, normalizarGeometria(gesto.current.atual, area));
        onPrevia(item.id, null);
        gesto.current = null;
        setPrevia(null);
      }
    }

    function iniciar(modo) {
      Keyboard.dismiss();
      onSelecionar(item.id);
      const origem = obterGeometriaItem(item, area);
      gesto.current = { origem, atual: origem, modo };
      setPrevia(origem);
      onPrevia(item.id, origem);
    }

    const eventos = {
      onPanResponderGrant: () => iniciar('posicao'),
      onPanResponderMove: (_, movimento) => {
        if (!gesto.current) return;
        const transformar = gesto.current.modo === 'tamanho' ? redimensionarGeometria : moverGeometria;
        const atual = transformar(gesto.current.origem, movimento.dx / escala, movimento.dy / escala, area);
        gesto.current.atual = atual;
        setPrevia(atual);
        onPrevia(item.id, atual);
      },
      onPanResponderRelease: concluir,
      onPanResponderTerminate: concluir,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    };
    return {
      corpo: PanResponder.create({
        ...eventos,
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, movimento) => !modoConexao && !gesto.current && !editando.current &&
          (Math.abs(movimento.dx) > 5 || Math.abs(movimento.dy) > 5),
      }),
      mover: PanResponder.create({ ...eventos, onStartShouldSetPanResponder: () => !modoConexao }),
      tamanho: PanResponder.create({ ...eventos, onStartShouldSetPanResponder: () => !modoConexao, onPanResponderGrant: () => iniciar('tamanho') }),
    };
  }, [item, area, onSelecionar, onAtualizar, onPrevia, escala, modoConexao]);
  /* eslint-enable react-hooks/refs */

  const geometria = previa || obterGeometriaItem(item, area);
  const estilo = obterEstiloItem(item);
  const raio = Math.min(estilo.raio, geometria.width / 2, geometria.height / 2);

  return (
    <View
      {...controles.corpo.panHandlers}
      style={[
        styles.item,
        { backgroundColor: estilo.fundo, borderColor: estilo.corBorda, borderWidth: estilo.espessuraBorda,
          borderRadius: raio, borderStyle: estilo.tracoBorda === 'tracejada' ? 'dashed' : estilo.tracoBorda === 'pontilhada' ? 'dotted' : 'solid' },
        geometria,
        { zIndex: ativo ? 2 : 1 },
      ]}
    >
      <Pressable style={styles.conteudo} onPress={() => onSelecionar(item.id)} accessibilityLabel={`Selecionar ${item.texto}`}>
        {item.tipo === 'imagem' ? (
          item.imagemIndisponivel || imagemErro || (!item.imagemDados && !item.imagemUri) ? (
            <View style={[styles.imagemIndisponivel, { borderRadius: raio }]} accessibilityLabel="Imagem não encontrada">
              <Ionicons name="image-outline" size={26} color="#94A3B8" />
              <Text style={styles.textoImagemIndisponivel} numberOfLines={2}>Imagem não encontrada</Text>
            </View>
          ) : (
            <Image
              style={[styles.imagem, { borderRadius: raio }]}
              source={{ uri: item.imagemDados || item.imagemUri }}
              resizeMode="contain"
              accessibilityLabel={item.texto || 'Imagem do mapa'}
              pointerEvents="none"
              onError={() => setImagemErro(true)}
            />
          )
        ) : <View style={styles.conteudo} pointerEvents={ativo && !modoConexao ? 'auto' : 'none'}>
          <TextInput
            style={[styles.textoItem, { fontSize: item.tamanhoFonte || 14, color: estilo.corTexto,
              fontFamily: obterFamiliaFonte(estilo.fonte, Platform.OS), fontWeight: estilo.negrito ? 'bold' : 'normal',
              fontStyle: estilo.italico ? 'italic' : 'normal', textDecorationLine: estilo.sublinhado ? 'underline' : 'none',
              textAlign: estilo.alinhamento, lineHeight: (item.tamanhoFonte || 14) * estilo.entrelinha }]}
            value={item.texto}
            editable={ativo && !modoConexao}
            onChangeText={(texto) => onAtualizar(item.id, { texto })}
            onFocus={() => { editando.current = true; }}
            onBlur={() => { editando.current = false; }}
            multiline
            accessibilityLabel={`Editar texto: ${item.texto}`}
          />
        </View>}
      </Pressable>
      {ativo && <View pointerEvents="none" style={[styles.selecionado, { borderRadius: raio + 3 }]} />}
      {ativo && !modoConexao && (
        <>
          <View {...controles.mover.panHandlers} style={[styles.alca, { width: 36 / escala, height: 36 / escala, borderRadius: 18 / escala, left: -3 / escala, top: -3 / escala }]} accessibilityLabel="Arraste para mover o item">
            <Ionicons name="move" size={18 / escala} color="#FFF" pointerEvents="none" />
          </View>
          <View {...controles.tamanho.panHandlers} style={[styles.alca, { width: 36 / escala, height: 36 / escala, borderRadius: 18 / escala, right: -3 / escala, bottom: -3 / escala }]} accessibilityLabel="Arraste para redimensionar o item">
            <Ionicons name="resize-outline" size={18 / escala} color="#FFF" pointerEvents="none" />
          </View>
        </>
      )}
    </View>
  );
}

export default memo(ItemMapa);

const styles = StyleSheet.create({
  item: { position: 'absolute', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  selecionado: { position: 'absolute', left: -3, right: -3, top: -3, bottom: -3, borderColor: '#263F78', borderStyle: 'dashed', borderWidth: 1 },
  conteudo: { flex: 1 },
  textoItem: { flex: 1, color: '#26324B', paddingHorizontal: 8, paddingVertical: 8, textAlignVertical: 'center' },
  imagem: { width: '100%', height: '100%' },
  imagemIndisponivel: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', padding: 8, gap: 4 },
  textoImagemIndisponivel: { color: '#64748B', fontSize: 10, textAlign: 'center', lineHeight: 13 },
  alca: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: '#263F78', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF', zIndex: 3 },
});
