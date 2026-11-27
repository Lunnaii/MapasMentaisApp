import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { limparImagensDoMapa } from './imagens';

const CHAVE_MAPAS_LOCAL = '@mapasmentais/mapas-v1';
const chaveCache = (uid) => `@mapasmentais/mapas-v2/${uid}`;

function removerIndefinidos(valor) {
  return JSON.parse(JSON.stringify(valor));
}

function uidAtual() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Entre em uma conta antes de acessar os mapas.');
  return uid;
}

async function lerCache(uid) {
  const conteudo = await AsyncStorage.getItem(chaveCache(uid));
  if (!conteudo) return null;
  try {
    const mapas = JSON.parse(conteudo);
    return Array.isArray(mapas) ? mapas : null;
  } catch {
    await AsyncStorage.removeItem(chaveCache(uid));
    return null;
  }
}

async function salvarCache(uid, mapas) {
  await AsyncStorage.setItem(chaveCache(uid), JSON.stringify(mapas));
}

async function prepararImagens(mapa) {
  const itens = await Promise.all((mapa.itens || []).map(async (item) => {
    if (item.tipo !== 'imagem') return item;

    let imagemDados = item.imagemDados;
    if (!imagemDados && typeof item.imagemUri === 'string') {
      if (item.imagemUri.startsWith('data:image/')) {
        imagemDados = item.imagemUri;
      } else if (Platform.OS !== 'web') {
        try {
          const arquivo = new File(item.imagemUri);
          if (arquivo.exists) {
            const base64 = await arquivo.base64();
            imagemDados = `data:${item.imagemMime || 'image/jpeg'};base64,${base64}`;
          }
        } catch {
          imagemDados = null;
        }
      }
    }

    if (typeof imagemDados === 'string' && imagemDados.length <= 650000) {
      return { ...item, imagemDados, imagemUri: null, imagemIndisponivel: false };
    }

    return { ...item, imagemDados: null, imagemUri: null, imagemIndisponivel: true };
  }));

  const preparado = { ...mapa, itens };
  if (JSON.stringify(preparado).length > 900000) {
    return {
      ...preparado,
      itens: itens.map((item) => item.tipo === 'imagem'
        ? { ...item, imagemDados: null, imagemUri: null, imagemIndisponivel: true }
        : item),
    };
  }
  return preparado;
}

async function migrarMapasLocais(uid) {
  const conteudo = await AsyncStorage.getItem(CHAVE_MAPAS_LOCAL);
  if (!conteudo) return;

  let mapasLocais;
  try {
    mapasLocais = JSON.parse(conteudo);
  } catch {
    await AsyncStorage.removeItem(CHAVE_MAPAS_LOCAL);
    return;
  }
  if (!Array.isArray(mapasLocais) || mapasLocais.length === 0) {
    await AsyncStorage.removeItem(CHAVE_MAPAS_LOCAL);
    return;
  }

  await Promise.all(mapasLocais.map(async (mapa) => {
    if (!mapa?.id) return;
    const preparado = await prepararImagens(mapa);
    await setDoc(doc(db, 'users', uid, 'mapas', mapa.id), removerIndefinidos({
      ...preparado,
      ownerUid: uid,
    }));
  }));

  await salvarCache(uid, mapasLocais);
  await AsyncStorage.removeItem(CHAVE_MAPAS_LOCAL);
}

export async function listarMapas() {
  const uid = uidAtual();
  const cache = await lerCache(uid);
  await migrarMapasLocais(uid);
  let snapshot;
  try {
    snapshot = await getDocs(collection(db, 'users', uid, 'mapas'));
  } catch {
    if (cache) return cache;
    throw new Error('Não foi possível carregar os mapas. Verifique sua conexão.');
  }
  const mapas = snapshot.docs
    .map((documento) => ({ id: documento.id, ...documento.data() }))
    .sort((a, b) => String(b.atualizadoEm || b.criadoEm || '').localeCompare(String(a.atualizadoEm || a.criadoEm || '')));
  await salvarCache(uid, mapas);
  return mapas;
}

export function ouvirMapas(onChange, onError) {
  const uid = uidAtual();
  let unsubscribe = () => {};
  let cancelado = false;

  lerCache(uid).then((cache) => {
    if (cache) onChange(cache);
  }).catch(onError);

  migrarMapasLocais(uid)
    .catch(onError)
    .finally(() => {
      if (cancelado) return;
      unsubscribe = onSnapshot(collection(db, 'users', uid, 'mapas'), (snapshot) => {
        const mapas = snapshot.docs
          .map((documento) => ({ id: documento.id, ...documento.data() }))
          .sort((a, b) => String(b.atualizadoEm || b.criadoEm || '').localeCompare(String(a.atualizadoEm || a.criadoEm || '')));
        salvarCache(uid, mapas).catch(onError);
        onChange(mapas);
      }, onError);
    });

  return () => {
    cancelado = true;
    unsubscribe();
  };
}

export async function excluirMapa(id) {
  const uid = uidAtual();
  const cache = await lerCache(uid);
  const mapas = cache || await listarMapas();
  const mapa = mapas.find((item) => item.id === id);
  const restantes = mapas.filter((item) => item.id !== id);
  await salvarCache(uid, restantes);

  try {
    await deleteDoc(doc(db, 'users', uid, 'mapas', id));
  } catch (erro) {
    await salvarCache(uid, mapas);
    throw erro;
  }
  if (mapa) {
    try {
      await limparImagensDoMapa(mapa, restantes);
    } catch {
      // O registro foi excluído; indisponibilidade do sistema de arquivos não reverte essa gravação.
    }
  }
  return restantes;
}

export async function salvarMapa(mapa) {
  const uid = uidAtual();
  const atualizado = await prepararImagens({
    ...mapa,
    atualizadoEm: new Date().toISOString(),
  });
  const documento = removerIndefinidos({
    ...atualizado,
    ownerUid: uid,
  });

  const cache = await lerCache(uid);
  const mapasCache = cache || [];
  const novosMapas = mapasCache.some((item) => item.id === mapa.id)
    ? mapasCache.map((item) => item.id === mapa.id ? documento : item)
    : [documento, ...mapasCache];
  await salvarCache(uid, novosMapas);

  try {
    await setDoc(doc(db, 'users', uid, 'mapas', mapa.id), documento);
  } catch (erro) {
    await salvarCache(uid, cache || []);
    throw erro;
  }
  return novosMapas;
}

