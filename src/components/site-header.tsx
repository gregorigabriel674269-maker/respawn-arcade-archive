import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { Gamepad2, Settings, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AccountButton } from "@/components/player-session";
import { SettingsPanel } from "@/components/settings-panel";
import { updatePrefs, usePrefs } from "@/lib/prefs";
import { catalogSearch } from "@/lib/catalog-search";

export function SiteHeader({ children }: { children?: ReactNode }) {
  const prefs = usePrefs();
  const [open, setOpen] = useState(false);
  const link = "hidden h-11 items-center rounded-full px-3 text-sm font-semibold text-muted-foreground md:inline-flex";
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2">
        <Link to="/" className="inline-flex h-11 items-center gap-2 font-display text-xl font-bold tracking-wider">
          <Gamepad2 className="h-6 w-6 text-primary" aria-hidden="true" />
          RESPAWN
        </Link>
        <Link to="/" className={link}>Início</Link>
        <Link to="/jogos" search={catalogSearch()} className={link}>Jogos</Link>
        <Link to="/rankings" className={link}>Rankings</Link>
        <Link to="/pedidos" className={link}>Pedidos</Link>
        <Link to="/desafio" className="inline-flex h-11 items-center px-3 text-sm font-semibold text-primary">Desafio</Link>
        <Link to="/controle" search={{room:''}} className={link}>Controle</Link>
        <Link to="/saves" className={link}>Saves</Link>
        <Link to="/admin" className={link}>ADMIN</Link>
        <Link to="/conta" className={link}>Atividade</Link>
        <button
          type="button"
          aria-pressed={prefs.school}
          onClick={() => updatePrefs({ school: !prefs.school })}
          className={`${link} ${prefs.school ? "text-primary" : ""}`}
        >
          Escola
        </button>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="hidden h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold md:inline-flex" aria-label="Personalizar">
            <Settings className="h-4 w-4" aria-hidden="true" />
            Ajustes
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <Dialog.Title className="font-display text-xl font-bold">Personalizar</Dialog.Title>
                <Dialog.Close aria-label="Fechar ajustes" className="grid h-11 w-11 place-items-center rounded-md">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">Tema, cor, tamanho dos cards e modo escola.</Dialog.Description>
              <SettingsPanel />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <div className="hidden md:block">
          <AccountButton />
        </div>
        <div className="w-full md:ml-auto md:w-80">{children}</div>
      </div>
    </header>
  );
}
