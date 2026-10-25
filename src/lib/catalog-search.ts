export type CatalogSearch = {
  q: string;
  platform: string;
  perf: string;
  duration: string;
  sort: string;
  category: string;
  device: string;
  minute: string;
  focus: string;
  tag: string;
};

export const catalogSearchDefaults: CatalogSearch = {
  q: "",
  platform: "Todos",
  perf: "todos",
  duration: "todos",
  sort: "pop",
  category: "Todos",
  device: "todos",
  minute: "",
  focus: "",
  tag: "",
};

export function catalogSearch(patch: Partial<CatalogSearch> = {}): CatalogSearch {
  return { ...catalogSearchDefaults, ...patch };
}
