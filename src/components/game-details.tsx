import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { DURATION_COPY, PERF_COPY } from "@/lib/classify";
import type { Enriched } from "@/lib/meta";
import { TAG_LABEL } from "@/lib/meta";
import { perfLabel } from "@/components/ui-bits";

const STATUS_LABEL = {
  ok: "Funcionando na última verificação",
  problem: "Instável na última verificação",
  unknown: "Não foi possível determinar o status",
  down: "Indisponível",
  copyright: "Remoção por direito autoral confirmada",
} as const;

export function GameDetails({
  game,
  onClose,
  onPlay,
}: {
  game: Enriched | null;
  onClose: () => void;
  onPlay: (game: Enriched) => void;
}) {
  return (
    <Dialog.Root open={Boolean(game)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[60] max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-5">
          {game ? (
            <>
              <Dialog.Title className="pr-10 font-display text-3xl font-bold uppercase">{game.name}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                {game.category} · {game.platform}
                {game.score != null ? ` · nota ${game.score}` : ""}
              </Dialog.Description>
              <Dialog.Close aria-label="Fechar detalhes" className="absolute top-3 right-3 grid h-11 w-11 place-items-center rounded-md">
                <X className="h-4 w-4" />
              </Dialog.Close>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold">{perfLabel(game.perf)}</dt>
                  <dd className="text-muted-foreground">{PERF_COPY[game.perf].body}</dd>
                </div>
                <div>
                  <dt className="font-semibold">
                    {game.duration === "curto" ? "Curto" : game.duration === "medio" ? "Médio" : "Longo"}
                  </dt>
                  <dd className="text-muted-foreground">{DURATION_COPY[game.duration]}</dd>
                </div>
                <div>
                  <dt className="font-semibold">{STATUS_LABEL[game.audit]}</dt>
                  <dd className="text-muted-foreground">
                    {game.auditNote || "Sem observação adicional."}
                    {game.checkedAt ? ` Verificado em ${game.checkedAt.slice(0, 10)}.` : ""}
                  </dd>
                </div>
                {game.tags.length > 0 ? (
                  <div>
                    <dt className="font-semibold">Tags</dt>
                    <dd className="text-muted-foreground">{game.tags.map((tag) => TAG_LABEL[tag]).join(" · ")}</dd>
                  </div>
                ) : null}
              </dl>
              <button
                type="button"
                onClick={() => onPlay(game)}
                className="tap mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
              >
                Jogar agora
              </button>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
