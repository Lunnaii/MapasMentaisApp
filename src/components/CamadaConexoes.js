import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { desenharConexao } from '../utils/conexoes';
import { obterTracejado } from '../utils/mapaEstilos';

function CamadaConexoes({ itens, conexoes, area, previa, escala = 1, selecionada, onSelecionar, modoConexao }) {
  return (
    <Svg width={area.width} height={area.height} style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {conexoes.map((conexao) => {
        const desenho = desenharConexao(conexao, itens, area, previa);
        if (!desenho) return null;
        const { caminho, estilo, setas } = desenho;
        return <G key={conexao.id}>
          {selecionada === conexao.id && <Path d={caminho} stroke="#C7D2FE" strokeWidth={estilo.espessura + 6 / escala} fill="none" pointerEvents="none" />}
          <Path d={caminho} stroke={estilo.cor} strokeWidth={estilo.espessura} strokeDasharray={obterTracejado(estilo.traco, estilo.espessura)} strokeLinecap="round" fill="none" pointerEvents="none" />
          {setas.map((d, indice) => <Path key={indice} d={d} fill={estilo.cor} pointerEvents="none" />)}
          {!modoConexao && <Path d={caminho} stroke="#000000" strokeOpacity={0.01} strokeWidth={Math.max(20 / escala, estilo.espessura)} fill="none" onPress={() => onSelecionar(conexao.id)} accessibilityLabel="Editar estilo da conexão" accessibilityRole="button" />}
        </G>;
      })}
    </Svg>
  );
}

export default memo(CamadaConexoes);
