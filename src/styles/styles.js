import { StyleSheet } from 'react-native';

const cores = {
  primaria: '#608ff4',
  fundo: '#F1F5F9',
  texto: '#1F2937',
  erro: '#461941',
};

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, padding: 20 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: cores.primaria, marginBottom: 16 },
  texto: { fontSize: 16, color: cores.texto, marginBottom: 8 },
  campo: {
    backgroundColor: '#938acc', borderWidth: 1, borderColor: '#938acc',
    borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16,
  },
  botao: { backgroundColor: cores.primaria, borderRadius: 8, padding: 14, alignItems: 'center' },
  textoBotao: { color: '#221670', fontWeight: 'bold', fontSize: 16 },
  erro: { color: cores.erro, marginBottom: 12 },
  cartao: { backgroundColor: '#FFF', borderRadius: 8, padding: 16, marginBottom: 12 },
  botaoConta: {
    position: 'absolute', left: 20,
    minWidth: 64, minHeight: 64,
    alignItems: 'center', justifyContent: 'center',},
  iconeConta: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#DCE8FF', alignItems: 'center', justifyContent: 'center',
  },
  textoBotaoConta: {color: cores.primaria, fontWeight: 'bold', fontSize: 12, marginTop: 3,},

  fundoPainel: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.35)' },
  sobreposicaoPainel: { ...StyleSheet.absoluteFillObject },
  painelConta: {
    position: 'absolute', top: 0, left: 0, right: 0,
    maxHeight: '80%', backgroundColor: '#FFF', borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16, overflow: 'hidden',
  },
  conteudoPainel: { padding: 20 },
  cabecalhoPainel: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  textoFechar: { color: cores.primaria, fontSize: 20,fontWeight: 'bold', padding: 10},
  botaoSair: {
    backgroundColor: cores.erro, borderRadius: 8, padding: 14, alignItems: 'center',
  },
  textoSair: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  
  link: { color: cores.primaria, textAlign: 'center', marginTop: 16, fontSize: 16 },
  sucesso: { color: '#15803D', marginBottom: 12 },
  conteudo: { flexGrow: 1, justifyContent: 'center' },
});
