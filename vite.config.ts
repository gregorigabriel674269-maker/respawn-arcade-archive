// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: { plugins: [VitePWA({ strategies:'generateSW', filename:'sw.js', registerType:'autoUpdate', injectRegister:null, devOptions:{enabled:false}, manifest:{name:'Respawn',short_name:'Respawn',display:'standalone',start_url:'/',theme_color:'#12141c',background_color:'#12141c',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]}, workbox:{globPatterns:['**/*.{js,css,png,svg,woff2}'],navigateFallback:null,runtimeCaching:[{urlPattern:({request,url})=>request.mode==='navigate'&&url.origin===self.location.origin&&['/','/jogos','/rankings','/pedidos'].includes(url.pathname),handler:'NetworkFirst',options:{cacheName:'respawn-pages',networkTimeoutSeconds:4,expiration:{maxEntries:12,maxAgeSeconds:604800}}},{urlPattern:({url})=>url.origin===self.location.origin&&url.pathname.startsWith('/assets/'),handler:'CacheFirst',options:{cacheName:'respawn-assets',expiration:{maxEntries:80,maxAgeSeconds:2592000}}},{urlPattern:({url})=>url.origin===self.location.origin&&url.pathname.startsWith('/covers/'),handler:'CacheFirst',options:{cacheName:'respawn-covers',expiration:{maxEntries:30,maxAgeSeconds:2592000}}}]}})] },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
