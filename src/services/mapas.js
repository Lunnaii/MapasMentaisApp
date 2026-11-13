import AsyncStorage from '@react-native-async-storage/async-storage';
import { limparImagensDoMapa } from './imagens';

const CHAVE_MAPAS = '@mapasmentais/mapas-v1';

export async function listarMapas() {
  const conteudo = await AsyncStorage.getItem(CHAVE_MAPAS);
  const mapas = conteudo === null ? [] : JSON.parse(conteudo);
  if (!Array.isArray(mapas)) throw new Error('Não foi possível ler os mapas salvos.');
  return mapas;
}

export async function excluirMapa(id) {
  const mapas = await listarMapas();
  const mapa = mapas.find((item) => item.id === id);
  const restantes = mapas.filter((item) => item.id !== id);
  await AsyncStorage.setItem(CHAVE_MAPAS, JSON.stringify(restantes));
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
  const mapas = await listarMapas();
  const atualizado = { ...mapa, atualizadoEm: new Date().toISOString() };
  const novosMapas = mapas.some((item) => item.id === mapa.id)
    ? mapas.map((item) => item.id === mapa.id ? atualizado : item)
    : [atualizado, ...mapas];
  await AsyncStorage.setItem(CHAVE_MAPAS, JSON.stringify(novosMapas));
  return novosMapas;
}

