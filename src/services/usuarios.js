import { createUserWithEmailAndPassword, signOut, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, authSecundario } from './firebase';

// Forma 2: a própria pessoa cria a conta e já fica logada.
export async function criarMinhaConta(nome, email, senha) {
  const { user } = await createUserWithEmailAndPassword(auth, email, senha);
  await updateProfile(user, { displayName: nome });
  await sendEmailVerification(user);
}

// Forma 3: um usuário logado cadastra outra pessoa sem perder a própria sessão.
export async function cadastrarOutroUsuario(nome, email, senha) {
  const { user } = await createUserWithEmailAndPassword(authSecundario, email, senha);
  try {
    await updateProfile(user, { displayName: nome });
    await sendEmailVerification(user);
  } finally {
    await signOut(authSecundario); // descarta a sessão do usuário recém-criado
  }
}

export function traduzirErroCadastro(codigo) {
  const mensagens = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.',
    'auth/password-does-not-meet-requirements': 'A senha não atende à política do projeto.',
    'auth/operation-not-allowed': 'Ative o login por e-mail/senha no console do Firebase.',
    'auth/network-request-failed': 'Sem conexão com a internet.',
  };
  return mensagens[codigo] ?? 'Não foi possível cadastrar. Tente novamente.';
}