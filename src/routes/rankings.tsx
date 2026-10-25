import { createFileRoute } from "@tanstack/react-router";
import { Flame, Star, Trophy, UserRound } from "lucide-react";
import { useSyncExternalStore } from "react";
import { usePlay } from "@/components/play-gate";
import { usePlayerSession } from "@/components/player-session";
import { PortalNav } from "@/components/portal-nav";
import { findGame } from "@/lib/catalog";
import {
  communityView,
  getCommunitySnapshot,
  getServerCommunitySnapshot,
  subscribeCommunity,
} from "@/lib/community";

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [{ title: "Rankings de jogos e jogadores — Respawn" },
      { name: "description", content: "Confira jogos mais jogados, avaliações e jogadores da comunidade Respawn." },
      { property: "og:title", content: "Rankings de jogos e jogadores — Respawn" },
      { property: "og:description", content: "Jogos populares e avaliações da comunidade Respawn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RankingsPage,
});

function RankingsPage() {
  const state = useSyncExternalStore(subscribeCommunity, getCommunitySnapshot, getServerCommunitySnapshot);
  const { plays, ratings, players } = communityView(state);
  const { user, openAuth } = usePlayerSession();
  const { requestPlay } = usePlay();

  const columns = [
    {
      title: "Mais jogadores",
      icon: <Flame className="h-5 w-5" aria-hidden="true" />,
      empty: "partidas",
      rows: plays.map((row) => ({ name: row.game_name, value: `${row.plays} jogadores` })),
    },
    {
      title: "Mais bem avaliados",
      icon: <Star className="h-5 w-5" aria-hidden="true" />,
      empty: "avaliações",
      rows: ratings.map((row) => ({
        name: row.game_name,
        value: `${row.average.toFixed(1)} ★ · ${row.votes} votos`,
      })),
    },
  ];

  return (
    <div className="min-h-screen">
      <PortalNav current="rankings" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="flex items-center gap-3 font-display text-3xl font-bold">
          <Trophy className="text-primary" aria-hidden="true" />
          Rankings
        </h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {columns.map((column) => (
            <section key={column.title}>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
                {column.icon}
                {column.title}
              </h2>
              {column.rows.length === 0 ? (
                <p className="py-8 text-muted-foreground">Ainda sem {column.empty} registradas.</p>
              ) : null}
              <ol className="divide-y divide-border">
                {column.rows.map((row, index) => (
                  <li key={row.name} className="flex items-center gap-3 py-3">
                    <span className="w-7 text-primary">{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const game = findGame(row.name);
                        if (game?.url) requestPlay(game);
                      }}
                      className="h-auto min-w-0 flex-1 justify-start p-0 text-left text-sm font-medium break-words text-foreground underline-offset-4 hover:underline"
                    >
                      {row.name}
                    </button>
                    <span className="shrink-0 text-xs text-muted-foreground">{row.value}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Ranking de jogadores</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            XP de participação validado pelo Respawn; não são pontuações internas dos jogos.
          </p>
          {user ? (
            <p className="mt-2 text-sm text-muted-foreground">Participação disponível em Minha conta.</p>
          ) : (
            <button type="button" onClick={openAuth} className="mt-2 h-9 px-4 text-sm font-medium text-primary hover:underline">
              Entrar para participar
            </button>
          )}
          <ol className="mt-4 divide-y divide-border">
            {players.map((player, index) => (
              <li key={player.id} className="flex items-center gap-3 py-3">
                <span className="w-7 text-primary">{index + 1}</span>
                {player.avatarDataUrl ? (
                  <img src={player.avatarDataUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <UserRound className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1 break-words">{player.displayName}</span>
                <span className="text-sm text-muted-foreground">{player.plays} XP</span>
              </li>
            ))}
          </ol>
          {players.length === 0 ? (
            <p className="py-8 text-muted-foreground">Nenhum jogador participante ainda.</p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
