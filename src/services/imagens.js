import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Directory, File, Paths } from 'expo-file-system';

export async function escolherImagem() {
  const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (resultado.canceled) return null;
  const imagem = resultado.assets[0];
  const contexto = ImageManipulator.manipulate(imagem.uri);
  let renderizada;
  try {
    const fator = Math.min(1, 1200 / Math.max(imagem.width || 1200, imagem.height || 1200));
    if (fator < 1) contexto.resize({ width: Math.max(1, Math.round(imagem.width * fator)) });
    renderizada = await contexto.renderAsync();
    const png = imagem.mimeType === 'image/png';
    const mime = png ? 'image/png' : 'image/jpeg';
    const salva = await renderizada.saveAsync({ format: png ? SaveFormat.PNG : SaveFormat.JPEG, compress: 0.75, base64: Platform.OS === 'web' });
    let uri;
    if (Platform.OS === 'web') {
      uri = `data:${mime};base64,${salva.base64}`;
    } else {
      const pasta = new Directory(Paths.document, 'imagens-mapas');
      pasta.create({ idempotent: true, intermediates: true });
      const arquivo = new File(pasta, `imagem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${png ? 'png' : 'jpg'}`);
      await new File(salva.uri).copy(arquivo);
      uri = arquivo.uri;
    }
    return { imagemUri: uri, imagemMime: mime, proporcaoImagem: salva.width / salva.height, texto: imagem.fileName || 'Imagem' };
  } finally {
    renderizada?.release();
    contexto.release();
  }
}

export async function incorporarImagens(mapa) {
  const itens = await Promise.all(mapa.itens.map(async (item) => {
    if (item.tipo !== 'imagem') return item;
    if (item.imagemUri?.startsWith('data:image/')) return { ...item, imagemDados: item.imagemUri };
    const base64 = await new File(item.imagemUri).base64();
    return { ...item, imagemDados: `data:${item.imagemMime || 'image/jpeg'};base64,${base64}` };
  }));
  return { ...mapa, itens };
}

export async function limparImagensDoMapa(mapa, restantes) {
  if (Platform.OS === 'web') return;
  const pasta = new Directory(Paths.document, 'imagens-mapas');
  const prefixo = pasta.uri.replace(/\/$/, '') + '/';
  const emUso = new Set(restantes.flatMap((salvo) => salvo.itens || []).map((item) => item.imagemUri));
  const imagens = new Set((mapa.itens || []).map((item) => item.imagemUri).filter((uri) =>
    typeof uri === 'string' && uri.startsWith(prefixo) && !uri.slice(prefixo.length).includes('/') && !emUso.has(uri)));
  // A exclusão do mapa já foi gravada; uma falha na limpeza não deve desfazer a exclusão.
  await Promise.allSettled([...imagens].map(async (uri) => {
    const arquivo = new File(uri);
    if (arquivo.exists) arquivo.delete();
  }));
}
