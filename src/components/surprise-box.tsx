import { useState } from "react";
import { pickSurprise, startOfToday, type Enriched } from "@/lib/meta";
import { getRecentSnapshot } from "@/lib/community";
import { PERF_COPY } from "@/lib/classify";
import { chipClass, perfLabel } from "@/components/ui-bits";
import { GameCover } from "@/components/game-cover";

type Mode = "any" | "leve" | "pop" | "rapido";

export function SurpriseBox({
  games,
  forceLight,
  images = true,
  onPlay,
}: {
  games: Enriched[];
  forceLight: boolean;
  images?: boolean;
  onPlay: (game: Enriched) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("any");
  const [picked, setPicked] = useState<Enriched | null>(null);
  const [rolling, setRolling] = useState(false);

  function roll() {
    let pool = games.filter((game) => game.audit !== "down" && game.audit !== "copyright");
    if (forceLight || mode === "leve") pool = pool.filter((game) => game.perf === "leve");
    if (mode === "pop") pool = pool.filter((game) => (game.score ?? 0) >= 85);
    if (mode === "rapido") pool = pool.filter((game) => game.minuteFit === 5 || game.minuteFit === 10);
    const recent = getRecentSnapshot();
    const today = recent.filter((item) => item.playedAt >= startOfToday()).map((item) => item.name);
    const last = localStorage.getItem("respawn-last-surprise");
    const next = pickSurprise(pool, last, today);
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.school === "on";
    if (next) localStorage.setItem("respawn-last-surprise", next.name);
    if (reduced) {
      setPicked(next);
      setRolling(false);
      return;
    }
    setRolling(true);
    window.setTimeout(() => {
      setPicked(next);
      setRolling(false);
    }, 420);
  }

  return (
    <section id="surpresa" className="mt-8 rounded-3xl border border-border bg-card p-5">
      <h2 className="font-display text-2xl font-bold uppercase">Não sei o que jogar</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        O sorteio usa os filtros desta tela{forceLight ? " e, no modo escola, só jogos leves" : ""}. Não escolhe jogo indisponível.
      </p>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          roll();
        }}
        className="tap mt-4 inline-flex h-12 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground"
      >
        Surpreenda-me
      </button>
      {open ? (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto">
            {(
              [
                ["any", "Qualquer"],
                ["leve", "Só leves"],
                ["pop", "Populares"],
                ["rapido", "Rápidos"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)} className={chipClass(mode === id)}>
                {label}
              </button>
            ))}
          </div>
          <div className={rolling ? "surprise-in rounded-2xl border border-border p-4" : "rounded-2xl border border-border p-4"}>
            {rolling ? (
              <p className="font-display text-xl font-bold">Sorteando...</p>
            ) : picked ? (
              <>
                <p className="text-xs font-bold tracking-widest text-primary uppercase">Sua surpresa</p>
                <GameCover name={picked.name} images={images} className="aspect-[2/3] w-28" sizes="112px" />
                <p className="mt-1 font-display text-2xl font-bold">{picked.name}</p>
                <p className="text-sm text-muted-foreground">
                  {picked.platform} · {picked.category} · {perfLabel(picked.perf)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{PERF_COPY[picked.perf].body}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onPlay(picked)} className="tap h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
                    Jogar agora
                  </button>
                  <button type="button" onClick={roll} className="tap h-11 rounded-full border border-border px-4 text-sm font-semibold">
                    Outro
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum jogo com esses filtros.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
