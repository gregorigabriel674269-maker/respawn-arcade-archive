import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const startChallenge=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
  const {data,error}=await context.supabase.rpc('start_daily_challenge');
  if(error) throw new Error(error.message.includes('três') ? 'Suas três tentativas de hoje acabaram.' : 'Não foi possível iniciar o desafio.');
  return data as unknown as {id:string;target:number;step:number;score:number;remaining:number};
});
export const hitTarget=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({run:z.uuid(),direction:z.number().int().min(0).max(3)})).handler(async ({data,context})=>{
  const {data:result,error}=await context.supabase.rpc('hit_daily_target',{_run:data.run,_direction:data.direction});
  if(error) throw new Error('Aguarde o alvo ou inicie uma nova partida.');
  return result as unknown as {done:boolean;target:number;step:number;score:number};
});
export const finishChallenge=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({run:z.uuid()})).handler(async ({data,context})=>{
  const {data:result,error}=await context.supabase.rpc('finish_daily_challenge',{_run:data.run});
  if(error) throw new Error('Não foi possível confirmar o resultado. Tente novamente.');
  return result as unknown as {done:boolean;step:number;score:number};
});