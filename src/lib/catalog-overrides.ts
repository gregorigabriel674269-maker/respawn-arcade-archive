import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/lib/catalog';
export type CatalogOverride={game_name:string;source_url:string;category:string;enabled:boolean};
let cache:CatalogOverride[]=[];const empty:CatalogOverride[]=[];const listeners=new Set<()=>void>();
export const subscribeCatalogOverrides=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export const getCatalogOverrides=()=>cache;export const getServerCatalogOverrides=()=>empty;
export async function refreshCatalogOverrides(){const {data,error}=await supabase.from('catalog_registry').select('game_name,source_url,category,enabled').eq('overridden',true);if(error)return;cache=data??[];listeners.forEach(fn=>fn());}
export function applyCatalogOverrides<T extends Game>(games:T[],overrides:CatalogOverride[]):T[]{return games.flatMap(game=>{const o=overrides.find(o=>o.game_name===game.name);return o?(o.enabled?[{...game,url:o.source_url,category:o.category}]:[]):[game];});}
export function addedCatalogGames(games:Game[],overrides:CatalogOverride[]):Game[]{return overrides.filter(o=>o.enabled&&!games.some(g=>g.name===o.game_name)).flatMap((o,i)=>{try{return [{name:o.game_name,url:o.source_url,category:o.category,host:new URL(o.source_url).hostname,index:games.length+i,featured:false}];}catch{return [];}});}
