import { applyCatalogOverrides,getCatalogOverrides,getServerCatalogOverrides,subscribeCatalogOverrides } from '@/lib/catalog-overrides';
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { GameCard } from "@/components/game-card";
import { GameDetails } from "@/components/game-details";
import { usePlay } from "@/components/play-gate";
import { SiteHeader } from "@/components/site-header";
import { SurpriseBox } from "@/components/surprise-box";
import { chipClass, perfLabel } from "@/components/ui-bits";
import { VirtualGrid } from "@/components/virtual-grid";
import { CATEGORIES } from "@/lib/catalog";
import { catalogSearch, type CatalogSearch } from "@/lib/catalog-search";
import type { DurationBand, Perf, Platform, TagId } from "@/lib/classify";
import { DURATION_COPY, PERF_COPY } from "@/lib/classify";
import {
  getFavSnapshot,
  getRecentSnapshot,
  getServerFavSnapshot,
  getServerRecentSnapshot,
  subscribeFavs,
  subscribeRecent,
  toggleFavorite,
} from "@/lib/community";
import { queryGames, suggestGames, TAG_LABEL, type DeviceFilter, type Enriched, type SortMode } from "@/lib/meta";
import { usePrefs } from "@/lib/prefs";

const PLATFORMS = ["Todos", "PC", "PS1", "PS2", "PSP", "N64", "SNES", "Arcade", "Web"] as const;
const PERFS = ["todos", "leve", "medio", "pesado"] as const;
const DURATIONS = ["todos", "curto", "medio", "longo"] as const;
const SORTS = [
  ["pop", "Popular"],
  ["az", "A-Z"],
  ["recent", "Recentes"],
] as const;
const DEVICES: { id: DeviceFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "chromebook", label: "Chromebook" },
  { id: "linux", label: "Linux" },
  { id: "web", label: "Web" },
  { id: "keyboard", label: "Teclado/mouse" },
  { id: "gamepad", label: "Controle" },
];
const TAGS = Object.keys(TAG_LABEL) as TagId[];

function asPlatform(value: string): Platform | "Todos" {
  return (PLATFORMS as readonly string[]).includes(value) ? (value as Platform | "Todos") : "Todos";
}
function asPerf(value: string): Perf | "todos" {
  return (PERFS as readonly string[]).includes(value) ? (value as Perf | "todos") : "todos";
}
function asDuration(value: string): DurationBand | "todos" {
  return (DURATIONS as readonly string[]).includes(value) ? (value as DurationBand | "todos") : "todos";
}
function asSort(value: string): SortMode {
  if (value === "az" || value === "recent" || value === "random" || value === "pop") return value;
  return "pop";
}
function asDevice(value: string): DeviceFilter {
  return DEVICES.some((item) => item.id === value) ? (value as DeviceFilter) : "todos";
}
function asMinute(value: string): 5 | 10 | 15 | null {
  if (value === "5" || value === "10" || value === "15") return Number(value) as 5 | 10 | 15;
  return null;
}

export function CatalogPage({ search }: { search: CatalogSearch }) {
  const prefs = usePrefs();
  const overrides=useSyncExternalStore(subscribeCatalogOverrides,getCatalogOverrides,getServerCatalogOverrides);
  const navigate = useNavigate();
  const hash = useRouterState({ select: (state) => state.location.hash });
  const { requestPlay } = usePlay();
  const favorites = useSyncExternalStore(subscribeFavs, getFavSnapshot, getServerFavSnapshot);
  const recent = useSyncExternalStore(subscribeRecent, getRecentSnapshot, getServerRecentSnapshot);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(search.q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [details, setDetails] = useState<Enriched | null>(null);
  const [width, setWidth] = useState(1100);
  const images = !(prefs.school && prefs.ultra);

  useEffect(() => setDraft(search.q), [search.q]);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    if (hash === "buscar") inputRef.current?.focus();
    return () => window.removeEventListener("resize", onResize);
  }, [hash]);

  function push(patch: Partial<CatalogSearch>) {
    void navigate({ to: "/jogos", search: catalogSearch({ ...search, ...patch }) });
  }

  const platform = asPlatform(search.platform);
  const perf = asPerf(search.perf);
  const duration = asDuration(search.duration);
  const sort = asSort(search.sort);
  const device = asDevice(search.device);
  const minute = asMinute(search.minute);
  const category = (CATEGORIES as readonly string[]).includes(search.category) ? search.category : "Todos";
  const tags = useMemo(() => search.tag.split(",").filter((tag): tag is TagId => TAGS.includes(tag as TagId)), [search.tag]);
  const focus = search.focus === "favs" || search.focus === "history" ? search.focus : "all";

  const filtered = useMemo(
    () =>
      applyCatalogOverrides(queryGames({
        text: search.q,
        category,
        platform,
        sort,
        perf,
        duration,
        minute,
        tags: tags,
        device,
        favorites,
        favoritesOnly: focus === "favs",
        onlyNames: focus === "history" ? recent.map((item) => item.name) : null,
        school: prefs.school,
      }),overrides),
    [overrides,search.q, category, platform, sort, perf, duration, minute, tags, device, favorites, recent, prefs.school, focus],
  );

  const suggestions = useMemo(() => (draft.trim() === search.q.trim() ? [] : suggestGames(draft)), [draft, search.q]);

  let columns = width < 700 ? 2 : width < 1100 ? 3 : 4;
  if (prefs.cardSize === "lg") columns = width < 700 ? 1 : width < 1100 ? 2 : 3;
  if (prefs.cardSize === "sm" || prefs.school) columns = width < 700 ? 2 : width < 1100 ? 4 : 5;
  // Cover is capped at 192px; stable row stride must equal actual card height.
  const cardWidth = (Math.min(width, 1152) - 24 - (columns - 1) * 12) / columns;
  const rowHeight = Math.ceil(Math.min(cardWidth - 2, 192) * 1.5 + 160);

  const filterBody = (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto">
        {CATEGORIES.map((item) => (
          <button key={item} type="button" aria-pressed={category === item} onClick={() => push({ category: item })} className={chipClass(category === item)}>
            {item}
          </button>
        ))}
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted-foreground">Plataforma</p>
        <div className="flex gap-2 overflow-x-auto">
          {PLATFORMS.map((item) => (
            <button key={item} type="button" aria-pressed={platform === item} onClick={() => push({ platform: item })} className={chipClass(platform === item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted-foreground">Desempenho</p>
        <div className="flex gap-2 overflow-x-auto">
          {PERFS.map((item) => (
            <button key={item} type="button" aria-pressed={perf === item} onClick={() => push({ perf: item })} className={chipClass(perf === item)}>
              {item === "todos" ? "Todos" : perfLabel(item)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted-foreground">Duração</p>
        <div className="flex gap-2 overflow-x-auto">
          {DURATIONS.map((item) => (
            <button key={item} type="button" aria-pressed={duration === item} onClick={() => push({ duration: item, minute: "" })} className={chipClass(duration === item)}>
              {item === "todos" ? "Todas" : item === "curto" ? "Curto" : item === "medio" ? "Médio" : "Longo"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted-foreground">Aparelho</p>
        <div className="flex gap-2 overflow-x-auto">
          {DEVICES.map((item) => (
            <button key={item.id} type="button" aria-pressed={device === item.id} onClick={() => push({ device: item.id })} className={chipClass(device === item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {TAGS.map((tag) => {
          const active = tags.includes(tag);
          const next = active ? tags.filter((item) => item !== tag) : [...tags, tag];
          return (
            <button key={tag} type="button" aria-pressed={active} onClick={() => push({ tag: next.join(",") })} className={chipClass(active)}>
              {TAG_LABEL[tag]}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{DURATION_COPY.curto} {PERF_COPY.leve.body}</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <SiteHeader>
        <form
          id="buscar"
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4"
          onSubmit={(event) => {
            event.preventDefault();
            push({ q: draft.trim() });
          }}
        >
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Nome, gênero, COD, GTA..."
            aria-label="Pesquisar jogos"
            className="h-11 w-full bg-transparent text-sm outline-none"
          />
        </form>
      </SiteHeader>
      {suggestions.length > 0 ? (
        <ul className="mx-auto max-w-6xl px-3">
          {suggestions.map((game) => (
            <li key={game.name}>
              <button type="button" onClick={() => push({ q: game.name })} className="flex h-11 w-full items-center justify-between text-left text-sm">
                <span className="truncate">{game.name}</span>
                <span className="text-xs text-muted-foreground">{game.platform}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <main className="mx-auto max-w-6xl px-3 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold uppercase">
            {focus === "favs" ? "Favoritos" : focus === "history" ? "Jogados recentemente" : "Catálogo"}
          </h1>
          <span className="text-sm text-muted-foreground">{filtered.length} jogos</span>
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold md:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filtros
          </button>
          <select
            value={sort === "random" ? "pop" : sort}
            aria-label="Ordenar"
            onChange={(event) => push({ sort: event.target.value })}
            className="ml-auto h-11 rounded-full border border-border bg-card px-3 text-sm"
          >
            {SORTS.map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>
        {prefs.school ? (
          <p className="mb-3 text-sm text-muted-foreground">Modo escola: jogos leves aparecem primeiro quando a ordem é Popular. Nada é escondido por causa do aparelho.</p>
        ) : null}
        <div className="mb-4 hidden md:block">{filterBody}</div>
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            Nenhum jogo encontrado.
            <span className="mt-1 block">Tente remover algum filtro.</span>
          </p>
        ) : (
          <VirtualGrid
            items={filtered}
            getKey={(game) => game.name}
            columns={columns}
            rowHeight={rowHeight}
            overscan={prefs.school ? 1 : 2}
            resetKey={`${search.q}|${category}|${platform}|${perf}|${duration}|${sort}|${device}|${minute}|${search.focus}|${search.tag}|${prefs.school}`}
            renderItem={(game) => (
              <GameCard
                game={game}
                favorite={favorites.includes(game.name)}
                images={images}
                onFavorite={() => toggleFavorite(game.name)}
                onPlay={requestPlay}
                onDetails={setDetails}
              />
            )}
          />
        )}
        <SurpriseBox games={filtered} forceLight={prefs.school && perf === "todos"} images={images} onPlay={requestPlay} />
      </main>
      <Dialog.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-border bg-card p-4 pb-8">
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title className="font-display text-xl font-bold">Filtros</Dialog.Title>
              <Dialog.Close aria-label="Fechar filtros" className="grid h-11 w-11 place-items-center">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Plataforma, desempenho, duração e tags.</Dialog.Description>
            {filterBody}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <GameDetails game={details} onClose={() => setDetails(null)} onPlay={requestPlay} />
    </div>
  );
}
