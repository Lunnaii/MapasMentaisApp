import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { gerarHtmlRasterizacao } from '../utils/rasterizarMapa';

export default function RasterizadorMapa({ svg, area, onConcluido, onErro }) {
  const finalizado = useRef(false);
  const source = useMemo(() => ({ html: gerarHtmlRasterizacao(svg, area) }), [svg, area]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!finalizado.current) {
        finalizado.current = true;
        onErro(new Error('A imagem demorou para carregar. Tente novamente.'));
      }
    }, 30000);
    return () => clearTimeout(timeout);
  }, [onErro]);

  function falhar() {
    if (finalizado.current) return;
    finalizado.current = true;
    onErro(new Error('Não foi possível preparar a prévia do mapa.'));
  }

  return <View style={styles.oculto} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <WebView source={source} originWhitelist={['*']} javaScriptEnabled domStorageEnabled={false} allowFileAccess={false} mixedContentMode="never" scrollEnabled={false}
      onShouldStartLoadWithRequest={(request) => request.url === 'about:blank' || request.url.startsWith('data:')}
      onError={falhar} onContentProcessDidTerminate={falhar} onRenderProcessGone={falhar}
      onMessage={({ nativeEvent }) => {
        if (finalizado.current) return;
        try {
          const resultado = JSON.parse(nativeEvent.data);
          if (resultado.erro || !resultado.png?.startsWith('data:image/png;base64,')) return falhar();
          finalizado.current = true;
          onConcluido(resultado.png);
        } catch { falhar(); }
      }} />
  </View>;
}

const styles = StyleSheet.create({ oculto: { position: 'absolute', left: 0, bottom: 0, width: 1, height: 1, opacity: 0 } });
