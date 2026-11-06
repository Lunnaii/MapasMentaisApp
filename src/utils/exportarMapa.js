import { obterGeometriaItem, obterTamanhoFolha } from './mapaLayout';
import { obterEstiloItem, obterFamiliaFonte, obterTracejado } from './mapaEstilos';
import { desenharConexao } from './conexoes';

function escaparXml(texto = '') {
  return texto.replace(/[&<>"']/g, (caractere) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[caractere]);
}

function quebrarTexto(texto, largura, fonte) {
  const limite = Math.max(1, Math.floor(largura / (fonte * 0.6)));
  return texto.split('\n').flatMap((paragrafo) => {
    if (!paragrafo) return [''];
    const palavras = paragrafo.split(/\s+/).flatMap((palavra) => {
      const partes = [];
      for (let i = 0; i < palavra.length; i += limite) partes.push(palavra.slice(i, i + limite));
      return partes;
    });
    const linhas = [];
    let linha = '';
    for (const palavra of palavras) {
      if (linha && linha.length + palavra.length + 1 > limite) {
        linhas.push(linha);
        linha = palavra;
      } else {
        linha = linha ? `${linha} ${palavra}` : palavra;
      }
    }
    linhas.push(linha);
    return linhas;
  });
}

export function gerarSvgMapa(mapa) {
  const area = obterTamanhoFolha(mapa);
  const ligacoes = (mapa.conexoes || []).map((conexao) => {
    const desenho = desenharConexao(conexao, mapa.itens, area);
    if (!desenho) return '';
    const { caminho, estilo, setas } = desenho;
    const traco = obterTracejado(estilo.traco, estilo.espessura);
    return `<path d="${caminho}" stroke="${escaparXml(estilo.cor)}" stroke-width="${estilo.espessura}" ${traco ? `stroke-dasharray="${traco.join(' ')}"` : ''} fill="none" stroke-linecap="round"/>${setas.map((d) => `<path d="${d}" fill="${escaparXml(estilo.cor)}"/>`).join('')}`;
  }).join('');
  const conteudo = mapa.itens.map((item, indice) => {
    const { left, top, width, height } = obterGeometriaItem(item, area);
    const y = top;
    const estilo = obterEstiloItem(item);
    const raio = Math.min(estilo.raio, width / 2, height / 2);
    const tracoBorda = obterTracejado(estilo.tracoBorda, estilo.espessuraBorda);
    const retangulo = `<rect x="${left}" y="${y}" width="${width}" height="${height}" rx="${raio}" fill="${escaparXml(estilo.fundo)}" stroke="${escaparXml(estilo.corBorda)}" stroke-width="${estilo.espessuraBorda}" ${tracoBorda ? `stroke-dasharray="${tracoBorda.join(' ')}"` : ''}/>`;
    const recorte = `<defs><clipPath id="item-${indice}"><rect x="${left}" y="${y}" width="${width}" height="${height}" rx="${raio}"/></clipPath></defs>`;
    if (item.tipo === 'imagem') {
      const dados = item.imagemDados || item.imagemUri;
      if (!dados?.startsWith('data:image/')) throw new Error('Não foi possível incorporar uma imagem ao arquivo.');
      return `<g>${recorte}${retangulo}<image x="${left}" y="${y}" width="${width}" height="${height}" href="${escaparXml(dados)}" preserveAspectRatio="xMidYMid meet" clip-path="url(#item-${indice})"/></g>`;
    }
    const fonte = item.tamanhoFonte || 14;
    const entrelinha = fonte * estilo.entrelinha;
    const linhas = quebrarTexto(item.texto || '', width - 16, fonte)
      .slice(0, Math.max(1, Math.floor((height - 16) / entrelinha)));
    const inicioTexto = y + (height - linhas.length * entrelinha) / 2 + fonte;
    const xTexto = estilo.alinhamento === 'left' ? left + 8 : estilo.alinhamento === 'right' ? left + width - 8 : left + width / 2;
    const ancora = estilo.alinhamento === 'left' ? 'start' : estilo.alinhamento === 'right' ? 'end' : 'middle';
    return `<g>${recorte}${retangulo}<g clip-path="url(#item-${indice})">${linhas.map((linha, n) => `<text x="${xTexto}" y="${inicioTexto + n * entrelinha}" text-anchor="${ancora}" font-family="${escaparXml(obterFamiliaFonte(estilo.fonte, 'svg'))}" font-size="${fonte}" font-weight="${estilo.negrito ? 'bold' : 'normal'}" font-style="${estilo.italico ? 'italic' : 'normal'}" text-decoration="${estilo.sublinhado ? 'underline' : 'none'}" fill="${escaparXml(estilo.corTexto)}">${escaparXml(linha)}</text>`).join('')}</g></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${area.width}" height="${area.height}" viewBox="0 0 ${area.width} ${area.height}"><title>${escaparXml(mapa.titulo)}</title><rect width="100%" height="100%" fill="#FFFFFF"/>${ligacoes}${conteudo}</svg>`;
}
