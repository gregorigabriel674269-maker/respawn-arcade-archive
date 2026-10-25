import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

export const unlockAdmin = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({code:z.string().min(1).max(256)})).handler(async ({data,context}) => {
  const {data:allowed,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(error || !allowed) throw new Error('Esta conta não possui permissão administrativa.');
  const secret=process.env['RESPAWN_ADMIN_CODE'];
  if(!secret) throw new Error('O código administrativo ainda não foi configurado.');
  const encode=new TextEncoder();
  const expected=new Uint8Array(await crypto.subtle.digest('SHA-256',encode.encode(secret)));
  const supplied=new Uint8Array(await crypto.subtle.digest('SHA-256',encode.encode(data.code)));
  let difference=0; for(let i=0;i<expected.length;i++) difference|=(expected[i] ?? 0)^(supplied[i] ?? 0);
  const session=typeof context.claims['session_id']==='string'?context.claims['session_id']:'';
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {data:result,error:attemptError}=await supabaseAdmin.rpc('record_admin_attempt',{_user:context.userId,_session:session,_success:difference===0});
  const state=result as {ok?:boolean;blocked?:boolean}|null;
  if(attemptError || !state?.ok) throw new Error(state?.blocked?'Acesso temporariamente bloqueado. Aguarde 15 minutos.':'Código não aceito. Confira o código administrativo.');
  return {ok:true};
});

export const adminOverview=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
  const {data,error}=await context.supabase.rpc('admin_overview');
  if(error) throw new Error('Acesso administrativo não autorizado ou expirado.');
  return data as unknown as {users:number;ratings:number;requests:number;opens:number;request_list:{id:string;title:string;status:string;votes:number;created_at:string}[];audit:{actor_id:string;action:string;resource:string;created_at:string}[]};
});
export const adminRequestStatus=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.uuid(),status:z.enum(['open','review','resolved','rejected'])})).handler(async ({data,context})=>{
 const {error}=await context.supabase.rpc('admin_set_request_status',{_request:data.id,_status:data.status});
 if(error) throw new Error('Não foi possível atualizar. Confira sua autorização administrativa.');
 return {ok:true};
});
export const getAdminReports=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
 const {data,error}=await context.supabase.rpc('admin_reports');if(error)throw new Error('Acesso administrativo expirado.');
 return data as unknown as {id:string;comment_id:string;reason:string;message:string;game_name:string;created_at:string}[];
});
export const moderateComment=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.uuid(),hidden:z.boolean()})).handler(async ({data,context})=>{
 const {error}=await context.supabase.rpc('admin_moderate_comment',{_id:data.id,_hidden:data.hidden});if(error)throw new Error('Não foi possível moderar o comentário.');return {ok:true};
});
export const lockAdmin=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
 const {error}=await context.supabase.rpc('admin_lock');if(error)throw new Error('Não foi possível encerrar o acesso.');return {ok:true};
});