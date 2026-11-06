import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function compartilharArquivo(arquivo) {
  if (!await Sharing.isAvailableAsync()) throw new Error('O compartilhamento de arquivos não está disponível neste aparelho.');
  const pasta = new Directory(Paths.cache, `exportacao-${Date.now()}`);
  pasta.create({ intermediates: true, idempotent: true });
  const destino = new File(pasta, arquivo.nome);
  destino.create({ overwrite: true });
  await destino.write(arquivo.bytes);
  await Sharing.shareAsync(destino.uri, { mimeType: arquivo.mime, UTI: arquivo.uti, dialogTitle: 'Compartilhar mapa mental' });
}
