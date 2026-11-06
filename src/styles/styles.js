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
  inicioCabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 28 },
  inicioSaudacao: { color: '#7C8AA5', fontSize: 13, fontWeight: '600', marginBottom: 5 },
  marcaInicio: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#E8ECFF', alignItems: 'center', justifyContent: 'center' },
  cartaoDestaque: { backgroundColor: '#FFF', borderRadius: 24, padding: 22, alignItems: 'center', shadowColor: '#64748B', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  ilustracaoDestaque: { width: 94, height: 94, borderRadius: 30, backgroundColor: '#F0F2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  pontoDestaque: { position: 'absolute', right: 6, bottom: 6, width: 25, height: 25, borderRadius: 13, backgroundColor: '#5B6EF5', alignItems: 'center', justifyContent: 'center' },
  tituloDestaque: { color: '#1E293B', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  descricaoDestaque: { color: '#718096', fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  botaoCriarMapa: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#5B6EF5', borderRadius: 14, paddingVertical: 14 },
  textoCriarMapa: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  tituloSecao: { color: '#334155', fontSize: 15, fontWeight: '700', marginTop: 28, marginBottom: 12 },
  cartaoDica: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF', borderRadius: 16, padding: 15 },
  iconeDica: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#FFF7E6', alignItems: 'center', justifyContent: 'center' },
  tituloDica: { color: '#334155', fontWeight: '700', fontSize: 13, marginBottom: 3 },
  textoDica: { color: '#8290A5', fontSize: 12, lineHeight: 17 },
  conteudoInicio: { paddingBottom: 112 },
  tituloMapasLinha: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 },
  contagemMapas: { color: '#64748B', fontSize: 11, fontWeight: '700', backgroundColor: '#E5EAF2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  estadoVazio: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 },
  textoVazio: { color: '#8290A5', fontSize: 12 },
  cartaoMapa: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EDF0F5' },
  detalheMapa: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  miniaturaMapa: { width: 48, height: 48, borderRadius: 13, backgroundColor: '#F0F2FF', alignItems: 'center', justifyContent: 'center' },
  nomeMapa: { color: '#334155', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  subtituloMapa: { color: '#94A3B8', fontSize: 11 },
  acoesMapa: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#F1F3F7', marginTop: 11, paddingTop: 9 },
  acaoMapa: { flexDirection: 'row', minHeight: 44, alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5 },
  textoAcaoMapa: { color: '#475569', fontSize: 11, fontWeight: '600' },
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
