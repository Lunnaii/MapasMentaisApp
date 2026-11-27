function iniciarDownload(arquivo) {
  const blob = new Blob([arquivo.bytes], { type: arquivo.mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = arquivo.nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function baixarArquivo(arquivo) {
  iniciarDownload(arquivo);
}

export async function compartilharArquivo(arquivo) {
  const blob = new Blob([arquivo.bytes], { type: arquivo.mime });
  const arquivoWeb = new File([blob], arquivo.nome, { type: arquivo.mime });
  if (navigator.canShare?.({ files: [arquivoWeb] }) && navigator.share) {
    try {
      await navigator.share({ files: [arquivoWeb], title: arquivo.nome });
      return;
    } catch (erro) {
      if (erro.name === 'AbortError') return;
      // Sem suporte ou sem ativação do navegador, o arquivo continua disponível por download.
    }
  }
  iniciarDownload(arquivo);
}
