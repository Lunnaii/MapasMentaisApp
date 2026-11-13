import { useEffect } from 'react';
import { rasterizarSvgNoNavegador } from '../utils/rasterizarMapa';

export default function RasterizadorMapa({ svg, area, onConcluido, onErro }) {
  useEffect(() => {
    let ativo = true;
    const timeout = setTimeout(() => {
      if (ativo) { ativo = false; onErro(new Error('A imagem demorou para carregar. Tente novamente.')); }
    }, 30000);
    rasterizarSvgNoNavegador(svg, area).then((png) => {
      if (ativo) { clearTimeout(timeout); onConcluido(png); }
    }).catch((erro) => { if (ativo) { clearTimeout(timeout); onErro(erro); } });
    return () => { ativo = false; clearTimeout(timeout); };
  }, [svg, area, onConcluido, onErro]);
  return null;
}
