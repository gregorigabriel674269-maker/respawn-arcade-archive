import { Heart } from "lucide-react";
import { GameCover } from "@/components/game-cover";
import { Button } from "@/components/ui/button";
import type { Enriched } from "@/lib/meta";
import { perfLabel } from "@/components/ui-bits";

const PERF_TEXT = {
  leve: "text-ok",
  medio: "text-warn",
  pesado: "text-bad",
} as const;

export function GameCard({
  game,
  favorite,
  images,
  onFavorite,
  onPlay,
  onDetails,
}: {
  game: Enriched;
  favorite: boolean;
  images: boolean;
  onFavorite: () => void;
  onPlay: (game: Enriched) => void;
  onDetails: (game: Enriched) => void;
}) {
  return (
    <article className="game-card flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative mx-auto aspect-[2/3] w-full max-w-48 shrink-0">
        <Button variant="ghost" type="button" onClick={() => onDetails(game)} className="absolute inset-0 h-full w-full overflow-hidden rounded-none p-0 text-left">
          <GameCover name={game.name} images={images} className="absolute inset-0" sizes="192px" />
          <span className="absolute top-2 left-2 rounded-full bg-background/85 px-2 py-0.5 text-xs font-semibold text-foreground">
            {game.platform}
          </span>
          <span className="sr-only">Detalhes de {game.name}</span>
        </Button>
        <Button variant="ghost"
          type="button"
          aria-label={favorite ? `Remover ${game.name} dos favoritos` : `Favoritar ${game.name}`}
          aria-pressed={favorite}
          onClick={onFavorite}
          className="absolute top-2 right-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-background/85 text-foreground"
        >
          <Heart className={`h-4 w-4 ${favorite ? "fill-accent text-accent" : ""}`} aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 min-h-10 font-display text-base leading-tight font-bold uppercase">{game.name}</h3>
        <p className={`text-xs font-semibold ${PERF_TEXT[game.perf]}`}>
          <span className="sr-only">Desempenho estimado: </span>
          {perfLabel(game.perf)}
          {game.audit === "problem" ? <span className="font-semibold text-warn"> · Instável</span> : null}
        </p>
        <Button
          type="button"
          onClick={() => onPlay(game)}
          className="tap mt-auto inline-flex h-11 items-center justify-center rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground"
        >
          Jogar
        </Button>
      </div>
    </article>
  );
}
