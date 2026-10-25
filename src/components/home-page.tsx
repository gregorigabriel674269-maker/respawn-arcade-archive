import { applyCatalogOverrides,getCatalogOverrides,getServerCatalogOverrides,subscribeCatalogOverrides } from '@/lib/catalog-overrides';
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Flame, History, Monitor, Search, Timer, Trophy } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { GameCard } from "@/components/game-card";
import { GameDetails } from "@/components/game-details";
import { usePlay } from "@/components/play-gate";
import { SiteHeader } from "@/components/site-header";
import { SurpriseBox } from "@/components/surprise-box";
import { chipClass, perfLabel } from "@/components/ui-bits";
import { GameCover } from "@/components/game-cover";
import { catalogSearch } from "@/lib/catalog-search";
import type { DeviceFilter, Enriched } from "@/lib/meta";
import {
  gameOfWeek,
  queryGames,
  suggestGames,
} from "@/lib/meta";
import { PERF_COPY } from "@/lib/classify";
import {
  getFavSnapshot,
  getRecentSnapshot,
  getServerFavSnapshot,
  getServerRecentSnapshot,
  subscribeFavs,
  subscribeRecent,
  toggleFavorite,
} from "@/lib/community";
import { updatePrefs, usePrefs } from "@/lib/prefs";

const DEVICES: { id: DeviceFilter; label: string }[] = [
  { id: "chromebook", label: "Chromebook" },
  { id: "linux", label: "Linux" },
  { id: "web", label: "Web" },
  { id: "keyboard", label: "Teclado/mouse" },
  { id: "gamepad", label: "Controle" },
];

function readLimited() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory;
  const low = typeof memory === "number" && memory <= 4;
  return { low, chromebook: /CrOS/.test(navigator.userAgent) };
}

function Rail({
  title,
  icon,
  href,
  children,
}: {
  title: string;
  icon: ReactNode;
  href: ReturnType<typeof catalogSearch>;
  children: ReactNode;
}) {
  return (
    <section className="rail-block mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold uppercase">
          {icon}
          {title}
        </h2>
        <Link to="/jogos" search={href} className="shrink-0 text-sm font-semibold text-primary">
          Ver todos
        </Link>
      </div>
      {children}
    </section>
  );
}

function RailRow({
  games,
  images,
  favorite,
  onPlay,
  onDetails,
}: {
  games: Enriched[];
  images: boolean;
  favorite: (name: string) => boolean;
  onPlay: (game: Enriched) => void;
  onDetails: (game: Enriched) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {games.map((game) => (
        <div key={game.name} className="w-40 shrink-0 sm:w-52">
          <GameCard
            game={game}
            favorite={favorite(game.name)}
            images={images}
            onFavorite={() => toggleFavorite(game.name)}
            onPlay={onPlay}
            onDetails={onDetails}
          />
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const prefs = usePrefs();
  const overrides=useSyncExternalStore(subscribeCatalogOverrides,getCatalogOverrides,getServerCatalogOverrides);
  const navigate = useNavigate();
  const hash = useRouterState({ select: (state) => state.location.hash });
  const { requestPlay } = usePlay();
  const favorites = useSyncExternalStore(subscribeFavs, getFavSnapshot, getServerFavSnapshot);
  const recent = useSyncExternalStore(subscribeRecent, getRecentSnapshot, getServerRecentSnapshot);
  const [text, setText] = useState("");
  const [quick, setQuick] = useState<5 | 10 | 15>(10);
  const [desk, setDesk] = useState<DeviceFilter>("chromebook");
  const [details, setDetails] = useState<Enriched | null>(null);
  const [hintOff, setHintOff] = useState(false);
  const [device, setDevice] = useState({ low: false, chromebook: false });
  const images = !(prefs.school && prefs.ultra);
  const limit = prefs.ultra ? 4 : prefs.school ? 4 : 8;

  useEffect(() => {
    setDevice(readLimited());
    if (sessionStorage.getItem("respawn-hint") === "off") setHintOff(true);
  }, []);

  useEffect(() => {
    if (hash === "surpresa" || hash === "topo") {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    }
  }, [hash]);

  const base = {
    text: "",
    category: "Todos",
    platform: "Todos" as const,
    sort: "pop" as const,
    perf: "todos" as const,
    duration: "todos" as const,
    minute: null,
    tags: [],
    device: "todos" as const,
    favorites,
    favoritesOnly: false,
    onlyNames: null,
    school: prefs.school,
  };

  const quickRail = useMemo(
    () => queryGames({ ...base, minute: quick }).slice(0, limit),
    [quick, limit, prefs.school, favorites],
  );
  const lightRail = useMemo(
    () => queryGames({ ...base, perf: "leve" }).slice(0, limit),
    [limit, prefs.school, favorites],
  );
  const deskRail = useMemo(
    () => queryGames({ ...base, device: desk }).slice(0, limit),
    [desk, limit, prefs.school, favorites],
  );
  const popular = useMemo(
    () => queryGames(base).filter((game) => game.score != null).slice(0, limit),
    [limit, prefs.school, favorites],
  );
  const newest = useMemo(
    () => queryGames({ ...base, sort: "recent" }).slice(0, limit),
    [limit, prefs.school, favorites],
  );
  const week = useMemo(() => gameOfWeek(), []);
  const suggestions = useMemo(() => suggestGames(text), [text]);
  const pool = useMemo(() => applyCatalogOverrides(queryGames(base),overrides), [prefs.school, favorites,overrides]);
  const continueGames = recent
    .flatMap((item) => {
      const game = pool.find((entry) => entry.name === item.name);
      return game ? [game] : [];
    })
    .slice(0, 8);
  const favoriteGames = favorites
    .flatMap((name) => {
      const game = pool.find((entry) => entry.name === name);
      return game ? [game] : [];
    })
    .slice(0, 8);
  const lastPlayed = continueGames[0];
  const because = useMemo(() => {
    if (!lastPlayed) return [];
    return queryGames({ ...base, category: lastPlayed.category })
      .filter((game) => game.name !== lastPlayed.name)
      .slice(0, 4);
  }, [lastPlayed, prefs.school, favorites]);

  const showHint = !hintOff && !prefs.school && (device.low || device.chromebook);

  return (
    <div id="topo" className="min-h-screen">
      <SiteHeader>
        <form
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4"
          onSubmit={(event) => {
            event.preventDefault();
            void navigate({ to: "/jogos", search: catalogSearch({ q: text.trim() }) });
          }}
        >
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Buscar jogos"
            aria-label="Pesquisar jogos"
            className="h-11 w-full bg-transparent text-sm outline-none"
          />
        </form>
        {suggestions.length > 0 && text.trim().length > 1 ? (
          <ul className="mt-2 rounded-2xl border border-border bg-card p-2">
            {suggestions.map((game) => (
              <li key={game.name}>
                <button
                  type="button"
                  onClick={() => void navigate({ to: "/jogos", search: catalogSearch({ q: game.name }) })}
                  className="flex h-11 w-full items-center justify-between gap-3 px-2 text-left text-sm"
                >
                  <span className="truncate">{game.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{game.platform}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </SiteHeader>

      {prefs.school ? (
        <p className="border-b border-border bg-secondary px-4 py-2 text-center text-sm">
          Modo escola ativado. Interface otimizada para dispositivos e conexões limitadas.
          {prefs.ultra ? " Ultra leve ligado: capas remotas ficam de fora." : ""}
        </p>
      ) : null}
      {showHint ? (
        <div className="border-b border-border bg-card px-4 py-3 text-sm">
          <p>Seu dispositivo parece limitado. Ativar Modo Escola?</p>
          <div className="mt-2 flex gap-2">
            <button type="button" className="h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={() => updatePrefs({ school: true })}>
              Ativar
            </button>
            <button
              type="button"
              className="h-11 rounded-full border border-border px-4 text-sm font-semibold"
              onClick={() => {
                sessionStorage.setItem("respawn-hint", "off");
                setHintOff(true);
              }}
            >
              Agora não
            </button>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-3 py-5">
        {week ? (
          <section className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="grid md:grid-cols-2">
              <div className="relative flex items-center justify-center bg-secondary py-3">
                <GameCover name={week.name} images={images} className="aspect-[2/3] w-36 sm:w-48" sizes="192px" />
              </div>
              <div className="flex flex-col justify-center p-5 sm:p-8">
                <p className="text-xs font-bold tracking-[0.22em] text-primary uppercase">Jogo da semana</p>
                <h1 className="mt-2 font-display text-4xl leading-none font-bold uppercase sm:text-5xl">{week.name}</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  {week.category} · {week.platform} · {perfLabel(week.perf)}
                  {week.score != null ? ` · nota ${week.score}` : ""}
                </p>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">{PERF_COPY[week.perf].body} Troca toda semana entre jogos com nota e link válido.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => requestPlay(week)} className="tap inline-flex h-12 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground">
                    Jogar agora
                  </button>
                  <button type="button" onClick={() => setDetails(week)} className="tap inline-flex h-12 items-center rounded-full border border-border px-5 text-sm font-semibold">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <Rail title="Você tem 10 minutos?" icon={<Timer className="h-5 w-5 text-primary" aria-hidden="true" />} href={catalogSearch({ minute: String(quick), duration: "curto" })}>
          <div className="mb-3 flex gap-2">
            {[5, 10, 15].map((value) => (
              <button key={value} type="button" aria-pressed={quick === value} onClick={() => setQuick(value as 5 | 10 | 15)} className={chipClass(quick === value)}>
                {value} min
              </button>
            ))}
          </div>
          <RailRow games={applyCatalogOverrides(quickRail,overrides)} images={images} favorite={(name) => favorites.includes(name)} onPlay={requestPlay} onDetails={setDetails} />
        </Rail>

        <Rail title="PC fraco" icon={<Monitor className="h-5 w-5 text-ok" aria-hidden="true" />} href={catalogSearch({ perf: "leve" })}>
          <RailRow games={applyCatalogOverrides(lightRail,overrides)} images={images} favorite={(name) => favorites.includes(name)} onPlay={requestPlay} onDetails={setDetails} />
        </Rail>

        <Rail title="Chromebook e Linux" icon={<Monitor className="h-5 w-5 text-primary" aria-hidden="true" />} href={catalogSearch({ device: desk })}>
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {DEVICES.map((item) => (
              <button key={item.id} type="button" aria-pressed={desk === item.id} onClick={() => setDesk(item.id)} className={chipClass(desk === item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <p className="mb-2 text-xs text-muted-foreground">Estimativa pelo tipo de site. Nenhum jogo some só porque o aparelho parece fraco.</p>
          <RailRow games={applyCatalogOverrides(deskRail,overrides)} images={images} favorite={(name) => favorites.includes(name)} onPlay={requestPlay} onDetails={setDetails} />
        </Rail>

        <Rail title="Mais populares" icon={<Flame className="h-5 w-5 text-accent" aria-hidden="true" />} href={catalogSearch({ sort: "pop" })}>
          <RailRow games={applyCatalogOverrides(popular,overrides)} images={images} favorite={(name) => favorites.includes(name)} onPlay={requestPlay} onDetails={setDetails} />
        </Rail>

        <Rail title="Recentes" icon={<History className="h-5 w-5" aria-hidden="true" />} href={catalogSearch({ sort: "recent" })}>
          <RailRow games={applyCatalogOverrides(newest,overrides)} images={images} favorite={(name) => favorites.includes(name)} onPlay={requestPlay} onDetails={setDetails} />
        </Rail>

        {continueGames.length > 0 ? (
          <Rail title="Continuar jogando" icon={<History className="h-5 w-5" aria-hidden="true" />} href={catalogSearch({ focus: "history" })}>
            <p className="mb-2 text-sm text-muted-foreground">Você jogou estes recentemente.</p>
            <RailRow games={continueGames} images={images} favorite={(name) => favorites.includes(name)} onPlay={requestPlay} onDetails={setDetails} />
          </Rail>
        ) : null}

        {favoriteGames.length > 0 ? (
          <Rail title="Meus jogos" icon={<Trophy className="h-5 w-5 text-accent" aria-hidden="true" />} href={catalogSearch({ focus: "favs" })}>
            <RailRow games={favoriteGames} images={images} favorite={() => true} onPlay={requestPlay} onDetails={setDetails} />
          </Rail>
        ) : null}

        {because.length > 0 && lastPlayed ? (
          <Rail title={`Porque você jogou ${lastPlayed.name}`} icon={<Flame className="h-5 w-5" aria-hidden="true" />} href={catalogSearch({ category: lastPlayed.category })}>
            <RailRow games={because} images={images} favorite={(name) => favorites.includes(name)} onPlay={requestPlay} onDetails={setDetails} />
          </Rail>
        ) : null}

        <SurpriseBox games={pool} forceLight={prefs.school} images={images} onPlay={requestPlay} />
      </main>
      <GameDetails game={details} onClose={() => setDetails(null)} onPlay={requestPlay} />
    </div>
  );
}
