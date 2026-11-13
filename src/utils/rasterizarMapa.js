export function gerarHtmlRasterizacao(svg, area) {
  const dados = JSON.stringify({ svg, width: area.width, height: area.height }).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body><script>
    (function () {
      var dados = ${dados};
      function enviar(resultado) { window.ReactNativeWebView.postMessage(JSON.stringify(resultado)); }
      try {
        var imagem = new Image();
        imagem.onload = function () {
          try {
            var canvas = document.createElement('canvas');
            canvas.width = dados.width;
            canvas.height = dados.height;
            var contexto = canvas.getContext('2d');
            if (!contexto) throw new Error('Canvas indisponível');
            contexto.fillStyle = '#FFFFFF';
            contexto.fillRect(0, 0, canvas.width, canvas.height);
            contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
            enviar({ png: canvas.toDataURL('image/png') });
          } catch (erro) { enviar({ erro: 'Não foi possível converter o mapa em imagem.' }); }
        };
        imagem.onerror = function () { enviar({ erro: 'Não foi possível carregar o desenho do mapa.' }); };
        imagem.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(dados.svg);
      } catch (erro) { enviar({ erro: 'Não foi possível preparar a imagem.' }); }
    })();
  </script></body></html>`;
}

export function rasterizarSvgNoNavegador(svg, area) {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    imagem.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = area.width;
        canvas.height = area.height;
        const contexto = canvas.getContext('2d');
        if (!contexto) throw new Error('Não foi possível preparar a imagem.');
        contexto.fillStyle = '#FFFFFF';
        contexto.fillRect(0, 0, canvas.width, canvas.height);
        contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch (erro) { reject(erro); }
    };
    imagem.onerror = () => reject(new Error('Não foi possível carregar o desenho do mapa.'));
    imagem.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
