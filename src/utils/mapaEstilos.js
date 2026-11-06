export const FONTES = [
  { id: 'padrao', nome: 'Sem serifa', ios: 'ui-sans-serif', android: 'sans-serif', web: 'sans-serif', svg: 'Arial, Helvetica, sans-serif' },
  { id: 'serifada', nome: 'Serifada', ios: 'ui-serif', android: 'serif', web: 'serif', svg: 'Georgia, Times New Roman, serif' },
  { id: 'mono', nome: 'Monoespaçada', ios: 'ui-monospace', android: 'monospace', web: 'monospace', svg: 'Courier New, monospace' },
];

export function obterFamiliaFonte(id, plataforma) {
  const fonte = FONTES.find((opcao) => opcao.id === id) || FONTES[0];
  return fonte[plataforma] || fonte.web;
}

export function obterEstiloItem(item) {
  const base = item.tipo === 'ideia'
    ? { fundo: '#EEF0FF', corBorda: '#C7CEFF', raio: 28, espessuraBorda: 1.5 }
    : item.tipo === 'retangulo'
      ? { fundo: '#E6FAF7', corBorda: '#99E3D7', raio: 8, espessuraBorda: 1.5 }
      : item.tipo === 'imagem'
        ? { fundo: 'transparent', corBorda: '#E2E8F0', raio: 8, espessuraBorda: 1 }
        : { fundo: 'transparent', corBorda: 'transparent', raio: 10, espessuraBorda: 0 };
  return {
    ...base, tracoBorda: 'solida', corTexto: '#26324B', fonte: 'padrao', negrito: false,
    italico: false, sublinhado: false, alinhamento: 'center', entrelinha: 1.25,
    ...item.estilo,
  };
}

export function obterEstiloConexao(conexao) {
  return { cor: '#64748B', espessura: 2, traco: 'solida', caminho: 'reta', seta: 'nenhuma', ...conexao.estilo };
}

export function obterTracejado(traco, espessura) {
  if (traco === 'tracejada') return [espessura * 4, espessura * 2];
  if (traco === 'pontilhada') return [1, Math.max(3, espessura * 2.5)];
  return undefined;
}
