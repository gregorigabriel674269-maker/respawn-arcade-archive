export const CONTROL_KEYS=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft',' ','Enter','z','x','c','v','q','e','1','3','Tab','w','d','s','a','i','l','k','j'] as const;
export function validControl(data:unknown):data is {key:string;down:boolean} {
 return !!data && typeof data==='object' && 'key' in data && 'down' in data && typeof data.down==='boolean' && CONTROL_KEYS.includes(data.key as typeof CONTROL_KEYS[number]);
}