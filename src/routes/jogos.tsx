import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog-page";
import { catalogSearch, type CatalogSearch } from "@/lib/catalog-search";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export const Route = createFileRoute("/jogos")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch =>
    catalogSearch({
      q: text(search.q),
      platform: text(search.platform) || "Todos",
      perf: text(search.perf) || "todos",
      duration: text(search.duration) || "todos",
      sort: text(search.sort) || "pop",
      category: text(search.category) || "Todos",
      device: text(search.device) || "todos",
      minute: text(search.minute),
      focus: text(search.focus),
      tag: text(search.tag),
    }),
  head: () => ({
    meta: [{ title: "Catálogo — Respawn" },
      { name: "description", content: "Explore o catálogo Respawn com capas originais e filtros por plataforma, categoria e desempenho." },
      { property: "og:title", content: "Catálogo de jogos — Respawn" },
      { property: "og:description", content: "Encontre sua próxima partida com busca, favoritos e filtros do Respawn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogRoute,
});

function CatalogRoute() {
  const search = Route.useSearch();
  return <CatalogPage search={search} />;
}
