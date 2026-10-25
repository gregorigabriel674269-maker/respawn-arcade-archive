import * as Dialog from "@radix-ui/react-dialog";
import { createContext, useContext, useState, type ReactNode } from "react";
import { GamePlayer } from "@/components/game-player";
import { Button } from "@/components/ui/button";
import { usePlayerSession } from "@/components/player-session";
import { toast } from "sonner";
import { safeGameUrl } from "@/lib/player-safety";
import type { Game } from "@/lib/catalog";
import { recordPlay, rememberPlay } from "@/lib/community";
import { applyCatalogOverrides,getCatalogOverrides } from '@/lib/catalog-overrides';

type PlayGateValue = {
  requestPlay: (game: Game) => void;
};

const PlayContext = createContext<PlayGateValue>({ requestPlay: () => undefined });

export function usePlay(): PlayGateValue {
  return useContext(PlayContext);
}

export function PlayProvider({ children }: { children: ReactNode }) {
  const { user } = usePlayerSession();
  const [choice, setChoice] = useState<Game | null>(null);
  const [playing, setPlaying] = useState<Game | null>(null);

  function requestPlay(game: Game) {
    const current=applyCatalogOverrides([game],getCatalogOverrides())[0];
    if(!current){toast.error('Este jogo está temporariamente indisponível.');return;}
    game=current;
    if (!safeGameUrl(game.url)) { toast.error("Este jogo está temporariamente indisponível."); return; }
    setChoice(game);
  }

  function playHere() {
    if (!choice) return;
    setPlaying(choice);
    setChoice(null);
  }

  function playTab() {
    if (!choice) return;
    const url = safeGameUrl(choice.url);
    if (!url) { toast.error("Este jogo está temporariamente indisponível."); return; }
    window.open(url, "_blank", "noopener,noreferrer");
    rememberPlay(choice.name);
    recordPlay(choice.name, user);
    setChoice(null);
  }

  return (
    <PlayContext.Provider value={{ requestPlay }}>
      {children}
      <Dialog.Root open={Boolean(choice)} onOpenChange={(open) => { if (!open) setChoice(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5">
            <Dialog.Title className="font-display text-2xl font-bold">Onde jogar?</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              {choice?.name}. Aqui abre no Respawn. Nova aba abre o site do jogo.
            </Dialog.Description>
            <div className="mt-5 flex flex-col gap-2">
              <Button type="button" onClick={playHere} className="h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
                Jogar aqui
              </Button>
              <Button type="button" variant="outline" onClick={playTab} className="h-11 rounded-full border border-border px-4 text-sm font-semibold">
                Nova aba
              </Button>
              <Dialog.Close className="h-11 rounded-full px-4 text-sm text-muted-foreground">Cancelar</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <GamePlayer game={playing} onClose={() => setPlaying(null)} />
    </PlayContext.Provider>
  );
}
