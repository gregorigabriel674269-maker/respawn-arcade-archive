import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const exchangeRtc = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ room:z.uuid(),peer:z.uuid(),op:z.enum(['poll','signal','leave']),name:z.string().max(50).default(''),since:z.number().int().min(0).default(0),to:z.uuid().optional(),kind:z.enum(['offer','answer','ice']).optional(),payload:z.unknown().optional() }))
  .handler(async ({data,context}) => {
    if(data.payload && JSON.stringify(data.payload).length>32768) throw new Error('Sinal muito grande.');
    const {data:result,error}=await context.supabase.rpc('rtc_guarded_exchange',{_room:data.room,_peer:data.peer,_op:data.op,_name:data.name,_since:data.since,_to:data.to,_kind:data.kind,_payload:data.payload as never});
    if(error) throw new Error('Não foi possível conectar a sala. Entre novamente ou tente outra sala.');
    return result;
  });
export const closeRtcRoom=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator(z.object({room:z.uuid()})).handler(async ({data,context})=>{const {error}=await context.supabase.rpc("rtc_close_room",{_room:data.room});if(error)throw new Error("Não foi possível encerrar a sala.");return {ok:true};});
