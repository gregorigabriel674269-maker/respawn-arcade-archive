import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Dices, Gamepad2, House, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { AccountButton } from "@/components/player-session";
import { SettingsPanel } from "@/components/settings-panel";
import { catalogSearch } from "@/lib/catalog-search";
import * as Dialog from '@radix-ui/react-dialog';

export function BottomNav() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const hash = useRouterState({ select: (state) => state.location.hash });
  const navigate = useNavigate();
  const [more, setMore] = useState(false);
  const item = (active: boolean) =>
    `flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${active ? "text-primary" : "text-muted-foreground"}`;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex">
          <button type="button" className={item(path === "/" && hash !== "surpresa")} onClick={() => void navigate({ to: "/", hash: "topo" })}>
            <House className="h-5 w-5" aria-hidden="true" />
            Início
          </button>
          <button type="button" className={item(path === "/jogos" && hash === "buscar")} onClick={() => void navigate({ to: "/jogos", search: catalogSearch(), hash: "buscar" })}>
            <Search className="h-5 w-5" aria-hidden="true" />
            Buscar
          </button>
          <button type="button" className={item(path === "/jogos" && hash !== "buscar")} onClick={() => void navigate({ to: "/jogos", search: catalogSearch() })}>
            <Gamepad2 className="h-5 w-5" aria-hidden="true" />
            Jogos
          </button>
          <button type="button" className={item(path === "/" && hash === "surpresa")} onClick={() => void navigate({ to: "/", hash: "surpresa" })}>
            <Dices className="h-5 w-5" aria-hidden="true" />
            Aleatório
          </button>
          <button type="button" className={item(more)} onClick={() => setMore(true)}>
            <Menu className="h-5 w-5" aria-hidden="true" />
            Mais
          </button>
        </div>
      </nav>
      <Dialog.Root open={more} onOpenChange={setMore}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 md:hidden"/>
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-border bg-card p-4 md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title className="font-display text-xl font-bold">Mais</Dialog.Title>
              <Dialog.Description className="sr-only">Navegação e ajustes da conta.</Dialog.Description>
              <button type="button" aria-label="Fechar" onClick={() => setMore(false)} className="grid h-11 w-11 place-items-center rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2 text-sm font-semibold">
              <button type="button" className="h-11 rounded-md bg-secondary px-3 text-left" onClick={() => { setMore(false); void navigate({ to: "/jogos", search: catalogSearch({ focus: "favs" }) }); }}>
                Meus jogos
              </button>
              <button type="button" className="h-11 rounded-md bg-secondary px-3 text-left" onClick={() => { setMore(false); void navigate({ to: "/jogos", search: catalogSearch({ focus: "history" }) }); }}>
                Continuar jogando
              </button>
              <Link to="/rankings" className="flex h-11 items-center rounded-md bg-secondary px-3" onClick={() => setMore(false)}>Rankings</Link>
              <Link to="/pedidos" className="flex h-11 items-center rounded-md bg-secondary px-3" onClick={() => setMore(false)}>Pedidos</Link>
              <Link to="/desafio" className="flex h-11 items-center rounded-md bg-secondary px-3" onClick={() => setMore(false)}>Desafio do dia</Link>
              <Link to="/controle" search={{room:''}} className="flex h-11 items-center rounded-md bg-secondary px-3" onClick={() => setMore(false)}>Controle pelo celular</Link>
              <Link to="/saves" className="flex h-11 items-center rounded-md bg-secondary px-3" onClick={() => setMore(false)}>Saves na nuvem</Link>
              <Link to="/admin" className="flex h-11 items-center rounded-md bg-secondary px-3" onClick={() => setMore(false)}>ADMIN</Link>
              <Link to="/conta" className="flex h-11 items-center rounded-md bg-secondary px-3" onClick={() => setMore(false)}>Minha atividade</Link>
            </div>
            <div className="mt-3" onClick={()=>setMore(false)}>
              <AccountButton />
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <h3 className="mb-3 font-display text-lg font-bold">Personalizar</h3>
              <SettingsPanel />
            </div>
          </Dialog.Content>
      </Dialog.Portal></Dialog.Root>
    </>
  );
}
