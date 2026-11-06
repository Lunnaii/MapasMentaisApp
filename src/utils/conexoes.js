import { obterPontosConexao } from './mapaLayout';
import { obterEstiloConexao } from './mapaEstilos';

function triangulo(ponta, vetor, tamanho) {
  const norma = Math.hypot(vetor.x, vetor.y) || 1;
  const ux = vetor.x / norma;
  const uy = vetor.y / norma;
  const bx = ponta.x - ux * tamanho;
  const by = ponta.y - uy * tamanho;
  return `M ${ponta.x} ${ponta.y} L ${bx - uy * tamanho * 0.5} ${by + ux * tamanho * 0.5} L ${bx + uy * tamanho * 0.5} ${by - ux * tamanho * 0.5} Z`;
}

export function desenharConexao(conexao, itens, area, previa = null) {
  const pontos = obterPontosConexao(conexao, itens, area, previa);
  if (!pontos) return null;
  const estilo = obterEstiloConexao(conexao);
  const { x1, y1, x2, y2 } = pontos;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.hypot(dx, dy) < 0.001) return null;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const c1 = horizontal ? { x: (x1 + x2) / 2, y: y1 } : { x: x1, y: (y1 + y2) / 2 };
  const c2 = horizontal ? { x: (x1 + x2) / 2, y: y2 } : { x: x2, y: (y1 + y2) / 2 };
  let caminho = `M ${x1} ${y1} L ${x2} ${y2}`;
  let vetor = { x: dx, y: dy };
  if (estilo.caminho === 'curva') {
    caminho = `M ${x1} ${y1} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${x2} ${y2}`;
    vetor = { x: x2 - c2.x, y: y2 - c2.y };
  } else if (estilo.caminho === 'cotovelo') {
    caminho = `M ${x1} ${y1} L ${c1.x} ${c1.y} L ${c2.x} ${c2.y} L ${x2} ${y2}`;
    vetor = horizontal ? { x: dx, y: 0 } : { x: 0, y: dy };
  }
  const setas = [];
  const tamanho = Math.max(6, estilo.espessura * 3);
  if (estilo.seta === 'fim' || estilo.seta === 'ambas') setas.push(triangulo({ x: x2, y: y2 }, vetor, tamanho));
  if (estilo.seta === 'ambas') setas.push(triangulo({ x: x1, y: y1 }, { x: -vetor.x, y: -vetor.y }, tamanho));
  return { caminho, setas, estilo };
}
