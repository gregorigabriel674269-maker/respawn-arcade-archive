export async function initializeOffline(){
 if(!('serviceWorker' in navigator))return;
 const host=window.location.hostname.toLowerCase();
 const preview=/^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+\.(?:lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host)||/^project--.+-dev\.(?:lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host)||['lovableproject.com','lovableproject-dev.com','beta.lovable.dev'].some(d=>host===d||host.endsWith('.'+d));
 const refused=!import.meta.env.PROD||window.self!==window.top||preview||new URLSearchParams(window.location.search).get('sw')==='off';
 if(refused){for(const r of await navigator.serviceWorker.getRegistrations()){const worker=r.active??r.waiting??r.installing;if(worker&&new URL(worker.scriptURL).pathname==='/sw.js')await r.unregister();}return;}
 const {registerSW}=await import('virtual:pwa-register');registerSW({immediate:true});
}