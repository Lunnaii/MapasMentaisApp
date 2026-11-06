const MARGEM = 4;
const LARGURA_MINIMA = 48;
const ALTURA_MINIMA = 32;

export function validarTamanhoMapa(largura, altura) {
  if (![largura, altura].every((valor) => /^\d+$/.test(String(valor)))) {
    throw new Error('Informe largura e altura em pixels inteiros.');
  }
  const width = Number(largura);
  const height = Number(altura);
  if ([width, height].some((valor) => valor < 64 || valor > 4096)) {
    throw new Error('Use medidas entre 64 e 4096 pixels.');
  }
  return { width, height };
}

export function obterTamanhoFolha(mapa) {
  try {
    return validarTamanhoMapa(Math.round(mapa?.tamanhoFolha?.width), Math.round(mapa?.tamanhoFolha?.height));
  } catch {
    return { width: 900, height: 600 };
  }
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

export function obterGeometriaItem(item, area) {
  const width = limitar((item.largura || 0.42) * area.width,
    Math.min(LARGURA_MINIMA, area.width - MARGEM * 2), area.width - MARGEM * 2);
  const height = limitar((item.altura || 0.13) * area.height,
    Math.min(ALTURA_MINIMA, area.height - MARGEM * 2), area.height - MARGEM * 2);
  return {
    left: limitar(item.x * area.width - width / 2, MARGEM, area.width - width - MARGEM),
    top: limitar(item.y * area.height - height / 2, MARGEM, area.height - height - MARGEM),
    width,
    height,
  };
}

export function moverGeometria(origem, dx, dy, area) {
  return {
    ...origem,
    left: limitar(origem.left + dx, MARGEM, area.width - origem.width - MARGEM),
    top: limitar(origem.top + dy, MARGEM, area.height - origem.height - MARGEM),
  };
}

export function redimensionarGeometria(origem, dx, dy, area) {
  return {
    ...origem,
    width: limitar(origem.width + dx,
      Math.min(LARGURA_MINIMA, origem.width), area.width - origem.left - MARGEM),
    height: limitar(origem.height + dy,
      Math.min(ALTURA_MINIMA, origem.height), area.height - origem.top - MARGEM),
  };
}

export function normalizarGeometria(geometria, area) {
  return {
    x: (geometria.left + geometria.width / 2) / area.width,
    y: (geometria.top + geometria.height / 2) / area.height,
    largura: geometria.width / area.width,
    altura: geometria.height / area.height,
  };
}

export function obterPontosConexao(conexao, itens, area, previa = null) {
  const origem = itens.find((item) => item.id === conexao.origem);
  const destino = itens.find((item) => item.id === conexao.destino);
  if (!origem || !destino || origem.id === destino.id) return null;
  const a = previa?.id === origem.id ? previa.geometria : obterGeometriaItem(origem, area);
  const b = previa?.id === destino.id ? previa.geometria : obterGeometriaItem(destino, area);
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;
  const dx = bx - ax;
  const dy = by - ay;
  if (!dx && !dy) return null;
  const razaoA = Math.min(dx ? a.width / 2 / Math.abs(dx) : Infinity, dy ? a.height / 2 / Math.abs(dy) : Infinity, 0.5);
  const razaoB = Math.min(dx ? b.width / 2 / Math.abs(dx) : Infinity, dy ? b.height / 2 / Math.abs(dy) : Infinity, 0.5);
  return { x1: ax + dx * razaoA, y1: ay + dy * razaoA, x2: bx - dx * razaoB, y2: by - dy * razaoB };
}
