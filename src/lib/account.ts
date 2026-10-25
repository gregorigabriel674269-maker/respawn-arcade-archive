import { supabase } from '@/integrations/supabase/client';
export type PublicUser = { id: string; email: string; displayName: string; avatarDataUrl: string | null; leaderboardEnabled: boolean };
let current: PublicUser | null = null;
let accountGeneration = 0;
const listeners = new Set<() => void>();
export const subscribeAuth = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getAuthSnapshot = () => current;
export const getServerAuthSnapshot = () => null;
export function clearAccount() {
  accountGeneration++;
  current = null;
  listeners.forEach(fn => fn());
}
export async function refreshAccount() {
  const generation = ++accountGeneration;
  const { data: { user } } = await supabase.auth.getUser();
  if (generation !== accountGeneration) return;
  if (!user) current = null;
  else {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (generation !== accountGeneration) return;
    current = { id: user.id, email: user.email ?? '', displayName: data?.display_name ?? 'Jogador', avatarDataUrl: data?.avatar_url ?? null, leaderboardEnabled: data?.leaderboard_enabled ?? false };
  }
  listeners.forEach(fn => fn());
}
export async function signUp(input: { email: string; password: string; displayName: string }) {
  const { data, error } = await supabase.auth.signUp({ email: input.email.trim(), password: input.password, options: { emailRedirectTo: window.location.origin, data: { display_name: input.displayName.trim() } } });
  if (error) {
    const code = (error as { code?: string }).code ?? '';
    if (code === 'over_email_send_rate_limit' || error.status === 429) throw new Error('Muitos cadastros em pouco tempo. O envio de emails de confirmação está no limite; tente novamente mais tarde.');
    if (code === 'user_already_exists') throw new Error('Este email já tem conta. Use "Entrar" ou "Esqueci minha senha".');
    if (code === 'weak_password') throw new Error('Senha fraca. Use pelo menos 8 caracteres com letras e números.');
    if (code === 'email_address_invalid') throw new Error('Este email não foi aceito. Use um endereço real.');
    throw new Error('Não foi possível criar a conta. Confira os dados e tente novamente.');
  }
  return Boolean(data.session);
}
export async function signIn(input: { email: string; password: string }) {
  const { error } = await supabase.auth.signInWithPassword({ email: input.email.trim(), password: input.password });
  if (error) throw new Error('Email ou senha inválidos.');
  await refreshAccount();
}
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
  if (error) throw new Error('Não foi possível enviar o email. Tente novamente.');
}
export async function signOut() { const { error } = await supabase.auth.signOut(); if (error) throw error; clearAccount(); }
export async function updateProfile(userId: string, patch: { displayName: string; leaderboardEnabled: boolean; avatarDataUrl?: string | null }) {
  const name = patch.displayName.trim();
  if (name.length < 2 || name.length > 50) throw new Error('Use um nome com 2 a 50 caracteres.');
  if (current?.id !== userId) throw new Error('Entre novamente.');
  const { error } = await supabase.from('profiles').update({ display_name: name, leaderboard_enabled: patch.leaderboardEnabled, avatar_url: patch.avatarDataUrl }).eq('id', userId);
  if (error) throw new Error('Não foi possível salvar o perfil.');
  await refreshAccount(); return current;
}
