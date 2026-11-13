import { PDFDocument, decodeFromBase64DataUri } from 'pdf-lib';
import { obterTamanhoFolha } from './mapaLayout';

export async function gerarArquivoMapa(mapa, formato, png) {
  if (!mapa?.id) throw new Error('Selecione um mapa salvo antes de compartilhar.');
  if (!['pdf', 'png'].includes(formato)) throw new Error('Escolha PDF ou PNG.');
  if (typeof png !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(png)) {
    throw new Error('A prévia do mapa ainda não está pronta.');
  }
  const bytes = decodeFromBase64DataUri(png);
  const assinatura = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 33 || !assinatura.every((valor, indice) => bytes[indice] === valor)) {
    throw new Error('Não foi possível gerar a imagem do mapa.');
  }
  const area = obterTamanhoFolha(mapa);
  const cabecalho = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (cabecalho.getUint32(16) !== area.width || cabecalho.getUint32(20) !== area.height) {
    throw new Error('A imagem gerada não corresponde ao tamanho do mapa selecionado.');
  }
  const titulo = (mapa.titulo || 'mapa-mental').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'mapa-mental';
  if (formato === 'png') {
    return { nome: `${titulo}.png`, bytes, mime: 'image/png', uti: 'public.png' };
  }
  const pdf = await PDFDocument.create();
  pdf.setTitle(mapa.titulo || 'Mapa mental');
  pdf.setCreator('MapasMentaisApp');
  // 1 pixel a 96 dpi equivale a 0,75 ponto PDF. Uma folha gera exatamente uma página.
  const width = area.width * 0.75;
  const height = area.height * 0.75;
  const imagem = await pdf.embedPng(bytes);
  const pagina = pdf.addPage([width, height]);
  pagina.drawImage(imagem, { x: 0, y: 0, width, height });
  return { nome: `${titulo}.pdf`, bytes: await pdf.save(), mime: 'application/pdf', uti: 'com.adobe.pdf' };
}
