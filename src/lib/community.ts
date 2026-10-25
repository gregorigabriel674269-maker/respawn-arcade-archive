import { findGame, type Game } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { getAuthSnapshot } from "@/lib/account";
import { toast } from "sonner";

export type RankPlayer = {
  id: string;
  displayName: string;
  avatarDataUrl: string | null;
  plays: number;
  leaderboard: boolean;
};

export type GameRequest = {
  votes?: number;
  status?: string;
  id: string;
  title: string;
  description: string;
  displayName: string;
  userId: string;
  createdAt: string;
  voterIds: string[];
};

type RatingBucket = { sum: number; votes: number; byUser: Record<string, number> };

export type CommunityState = {
  extraPlays: Record<string, number>;
  ratings: Record<string, RatingBucket>;
  players: RankPlayer[];
  requests: GameRequest[];
};

const EVENT = "respawn-community";

export const EMPTY_COMMUNITY: CommunityState = {
  extraPlays: {},
  ratings: {},
  players: [],
  requests: [],
};

const SEED_PLAYS: Record<string, number> = {};
const SEED_PLAYERS: RankPlayer[] = [];

let cacheValue: CommunityState = EMPTY_COMMUNITY;
let communityGeneration = 0;

export function subscribeCommunity(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener(EVENT, callback);
  };
}

export function getCommunitySnapshot(): CommunityState { return cacheValue; }
export function clearPrivateCommunity() {
  communityGeneration++;
  cacheValue = { ...cacheValue, ratings: Object.fromEntries(Object.entries(cacheValue.ratings).filter(([, bucket]) => bucket.votes > 0).map(([name, bucket]) => [name, { ...bucket, byUser: {} }])), requests: cacheValue.requests.map(request => ({ ...request, userId: '', voterIds: [] })) };
  window.dispatchEvent(new Event(EVENT));
}
export async function refreshCommunity() {
  const generation = ++communityGeneration;
  const user = getAuthSnapshot();
  const { data, error } = await supabase.rpc('community_summary');
  if (error || !data || typeof data !== 'object') return;
  const summary = data as unknown as { plays: {game_name:string;plays:number}[]; ratings: {game_name:string;average:number;votes:number}[]; players: {id:string;display_name:string;avatar_url:string|null;plays:number}[]; requests:{id:string;status?:string;user_id:string;title:string;description:string;display_name:string;created_at:string;votes:number}[] };
  const ownRatings = user ? await supabase.from('game_ratings').select('*').eq('user_id',user.id) : {data:[]};
  const ownVotes = user ? await supabase.from('request_votes').select('request_id').eq('user_id',user.id) : {data:[]};
  if (generation !== communityGeneration || getAuthSnapshot()?.id !== user?.id) return;
  cacheValue = { extraPlays: Object.fromEntries(summary.plays.map(r=>[r.game_name,Number(r.plays)])), ratings: Object.fromEntries(summary.ratings.map(r=>[r.game_name,{sum:Number(r.average)*Number(r.votes),votes:Number(r.votes),byUser: Object.fromEntries((ownRatings.data ?? []).filter(v=>v.game_name===r.game_name).map(v=>[v.user_id,v.rating]))}])), players:summary.players.map(p=>({id:p.id,displayName:p.display_name,avatarDataUrl:p.avatar_url,plays:Number(p.plays),leaderboard:true})), requests: summary.requests.map(r=>({id:r.id,status:r.status,userId:user && r.user_id===user.id ? r.user_id : '',title:r.title,description:r.description,displayName:r.display_name,createdAt:r.created_at,votes:Number(r.votes),voterIds:user && ownVotes.data?.some(v=>v.request_id===r.id) ? [user.id]:[]})) };
  for (const own of ownRatings.data ?? []) {
    const bucket = cacheValue.ratings[own.game_name] ?? {sum:0,votes:0,byUser:{}};
    cacheValue.ratings[own.game_name] = {...bucket,byUser:{...bucket.byUser,[own.user_id]:own.rating}};
  }
  window.dispatchEvent(new Event(EVENT));
}
async function checked(result: {error: unknown}) { if (result.error) throw new Error('Não foi possível salvar. Tente novamente.'); await refreshCommunity(); }
export function clearLibrary() { localStorage.removeItem(libraryKey(FAV_KEY));localStorage.removeItem(libraryKey(RECENT_KEY)); favCacheRaw='';favCache=[];recentCacheRaw='';recentCache=[]; clearPrivateCommunity(); window.dispatchEvent(new Event(FAV_EVENT));window.dispatchEvent(new Event(RECENT_EVENT)); }
const librarySyncs = new Map<string, Promise<void>>();
export function syncLibrary(): Promise<void> {
  const user = getAuthSnapshot();
  if (!user) return Promise.resolve();
  const existing = librarySyncs.get(user.id);
  if (existing) return existing;
  const pending = syncLibraryForAccount().finally(() => librarySyncs.delete(user.id));
  librarySyncs.set(user.id, pending);
  return pending;
}
async function syncLibraryForAccount() {
  const user = getAuthSnapshot(); if (!user) return;
  const marker = `respawn-imported-${user.id}`;
  if (!localStorage.getItem(marker)) {
    const rows = new Map<string,{user_id:string;game_name:string;favorite:boolean;played_at?:string}>();
    let guestFavorites: string[] = [];
    let guestHistory: RecentPlay[] = [];
    try {
      const favorites: unknown = JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]');
      const history: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
      if (Array.isArray(favorites)) guestFavorites = favorites.filter((name): name is string => typeof name === 'string');
      if (Array.isArray(history)) guestHistory = history.filter((item): item is RecentPlay => typeof item?.name === 'string' && typeof item?.playedAt === 'number' && Number.isFinite(item.playedAt) && !Number.isNaN(new Date(item.playedAt).getTime()));
    } catch { /* Malformed guest caches are never imported. */ }
    for (const name of guestFavorites) rows.set(name,{user_id:user.id,game_name:name,favorite:true});
    for (const item of guestHistory) rows.set(item.name,{...rows.get(item.name),user_id:user.id,game_name:item.name,favorite:rows.get(item.name)?.favorite ?? false,played_at:new Date(item.playedAt).toISOString()});
    if (getAuthSnapshot()?.id !== user.id) return;
    if (rows.size) { const { error }=await supabase.from('player_library').upsert([...rows.values()]); if(error) return; }
    if (getAuthSnapshot()?.id !== user.id) return;
    localStorage.setItem(marker,'1');
    localStorage.removeItem(FAV_KEY); localStorage.removeItem(RECENT_KEY);
  }
  const {data,error}=await supabase.from('player_library').select('*').eq('user_id',user.id); if(error || getAuthSnapshot()?.id!==user.id) return;
  favCache=(data ?? []).filter(r=>r.favorite).map(r=>r.game_name); favCacheRaw=JSON.stringify(favCache);localStorage.setItem(libraryKey(FAV_KEY),favCacheRaw);
  recentCache=(data ?? []).filter(r=>r.played_at).map(r=>({name:r.game_name,playedAt:Date.parse(r.played_at ?? '')})).sort((a,b)=>b.playedAt-a.playedAt).slice(0,30);recentCacheRaw=JSON.stringify(recentCache);localStorage.setItem(libraryKey(RECENT_KEY),recentCacheRaw);
  window.dispatchEvent(new Event(FAV_EVENT));window.dispatchEvent(new Event(RECENT_EVENT));
  await refreshCommunity();
}

export function getServerCommunitySnapshot(): CommunityState {
  return EMPTY_COMMUNITY;
}

export function communityView(state: CommunityState) {
  const playsMap: Record<string, number> = { ...SEED_PLAYS };
  for (const [name, count] of Object.entries(state.extraPlays)) {
    playsMap[name] = (playsMap[name] ?? 0) + count;
  }
  const plays = Object.entries(playsMap)
    .map(([game_name, plays]) => ({ game_name, plays }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 20);

  const ratings = Object.entries(state.ratings)
    .map(([game_name, bucket]) => ({
      game_name,
      average: bucket.votes ? bucket.sum / bucket.votes : 0,
      votes: bucket.votes,
    }))
    .filter((row) => row.votes > 0)
    .sort((a, b) => (b.average*b.votes+15)/(b.votes+5) - (a.average*a.votes+15)/(a.votes+5) || b.votes-a.votes)
    .slice(0, 20);

  const players = [...SEED_PLAYERS, ...state.players.filter((player) => player.leaderboard)].sort(
    (a, b) => b.plays - a.plays || a.displayName.localeCompare(b.displayName),
  );

  const requests = state.requests
    .map((request) => ({ ...request, votes: request.votes ?? request.voterIds.length }))
    .sort((a, b) => b.votes - a.votes || b.createdAt.localeCompare(a.createdAt));

  return { plays, ratings, players, requests };
}

export function recordPlay(gameName: string, user: {id:string} | null) {
  if (!user) return;
  void supabase.from('play_events').insert({user_id:user.id,game_name:gameName}).then(async ({error})=>{if(!error) await refreshCommunity();});
}

export function userRating(state: CommunityState, gameName: string, userId: string) {
  return state.ratings[gameName]?.byUser[userId] ?? 0;
}

export async function rateGame(gameName:string,userId:string,rating:number) { await checked(await supabase.from('game_ratings').upsert({user_id:userId,game_name:gameName,rating})); }
export function syncLeaderboardPlayer(_user: unknown) { void refreshCommunity(); }
export async function addRequest(input: {title:string;description:string;userId:string;displayName:string}) { const result=await supabase.from('game_requests').insert({user_id:input.userId,title:input.title.trim(),description:input.description.trim()});if(result.error?.message.includes('Já existe'))throw new Error('Já existe um pedido desse jogo. Vote no pedido existente.');await checked(result); }
export async function toggleRequestVote(requestId:string,userId:string) {
  const {data,error}=await supabase.from('request_votes').select('request_id').eq('request_id',requestId).eq('user_id',userId).maybeSingle();
  if(error) throw new Error('Não foi possível votar.');
  await checked(data ? await supabase.from('request_votes').delete().eq('request_id',requestId).eq('user_id',userId) : await supabase.from('request_votes').insert({request_id:requestId,user_id:userId}));
}
export async function saveFeedback(gameName:string,userId:string,message:string) { await checked(await supabase.from('game_feedback').insert({game_name:gameName,user_id:userId,message:message.trim()})); }

export type RecentPlay = { name: string; playedAt: number };

const EMPTY_RECENT: RecentPlay[] = [];
const EMPTY_FAVS: string[] = [];

const RECENT_KEY = "respawn-recent";
function libraryKey(base: string): string {
  const user = getAuthSnapshot();
  return user ? `${base}:${user.id}` : base;
}
const RECENT_EVENT = "respawn-history";
let recentCacheRaw = "";
let recentCache: RecentPlay[] = [];

export function subscribeRecent(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === libraryKey(RECENT_KEY) || event.key === null) {
      recentCacheRaw = "";
      callback();
    }
  };
  window.addEventListener(RECENT_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(RECENT_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function getRecentSnapshot(): RecentPlay[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(libraryKey(RECENT_KEY)) ?? "";
  if (raw === recentCacheRaw) return recentCache;
  recentCacheRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as RecentPlay[]) : [];
    recentCache = Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.name === "string" && typeof item.playedAt === "number")
      : [];
  } catch {
    recentCache = [];
  }
  return recentCache;
}

export function getServerRecentSnapshot(): RecentPlay[] {
  return EMPTY_RECENT;
}

export function rememberPlay(name: string) {
  const next = [{ name, playedAt: Date.now() }, ...getRecentSnapshot().filter((item) => item.name !== name)].slice(
    0,
    30,
  );
  const raw = JSON.stringify(next);
  localStorage.setItem(libraryKey(RECENT_KEY), raw);
  recentCacheRaw = raw;
  recentCache = next;
  window.dispatchEvent(new Event(RECENT_EVENT));
  const user=getAuthSnapshot(); if(user) void supabase.from('player_library').upsert({user_id:user.id,game_name:name,favorite:getFavSnapshot().includes(name),played_at:new Date().toISOString()}).then(({error})=>{if(error) toast.error('Histórico não sincronizado.');});
}

const FAV_KEY = "favs";
const FAV_EVENT = "respawn-favs";
let favCacheRaw = "";
let favCache: string[] = [];

export function subscribeFavs(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === libraryKey(FAV_KEY) || event.key === null) {
      favCacheRaw = "";
      callback();
    }
  };
  window.addEventListener(FAV_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(FAV_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function getFavSnapshot(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(libraryKey(FAV_KEY)) ?? "";
  if (raw === favCacheRaw) return favCache;
  favCacheRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    favCache = Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    favCache = [];
  }
  return favCache;
}

export function getServerFavSnapshot(): string[] {
  return EMPTY_FAVS;
}

export function toggleFavorite(name: string) {
  const current = getFavSnapshot();
  const next = current.includes(name) ? current.filter((item) => item !== name) : [...current, name];
  const raw = JSON.stringify(next);
  localStorage.setItem(libraryKey(FAV_KEY), raw);
  favCacheRaw = raw;
  favCache = next;
  window.dispatchEvent(new Event(FAV_EVENT));
  const user=getAuthSnapshot(); if(user) void supabase.from('player_library').upsert({user_id:user.id,game_name:name,favorite:next.includes(name)}).then(({error})=>{if(error) { toast.error('Favorito não sincronizado.'); void syncLibrary(); }});
}

export function gameFromRanking(name: string): Game | null {
  return findGame(name);
}
