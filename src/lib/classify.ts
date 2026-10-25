export type Platform = "PC" | "PS1" | "PS2" | "PSP" | "N64" | "SNES" | "Arcade" | "Web";
export type Perf = "leve" | "medio" | "pesado";
export type DurationBand = "curto" | "medio" | "longo";
export type TagId = "retro" | "rapido" | "leve" | "multiplayer" | "terror" | "classico" | "pc" | "mobile";

export type Classified = {
  platform: Platform;
  perf: Perf;
  duration: DurationBand;
  /** Smallest quick-session bucket this game still fits. Null = not a short session. */
  minuteFit: 5 | 10 | 15 | null;
  tags: TagId[];
  devices: {
    web: boolean;
    chromebook: boolean;
    linux: boolean;
    keyboard: boolean;
    gamepad: boolean;
  };
  searchExtra: string;
};

const PSP = [
  "tekken dark resurrection",
  "ultimate ninja impact",
  "silent hill: origins",
  "silent hill origins",
  "worms open warfare",
  "god of war: chains",
  "grand theft auto: liberty city stories",
  "grand theft auto: vice city stories",
];

const N64 = [
  "super mario 64",
  "mario 64",
  "goldeneye",
  "perfect dark",
  "diddy kong racing",
  "super smash bros.",
  "ocarina of time",
  "majora",
  "banjo-kazooie",
  "banjo kazooie",
  "conker",
  "mario kart 64",
  "star fox 64",
  "f-zero x",
  "paper mario",
];

const SNES = [
  "super mario kart",
  "super mario world",
  "super metroid",
  "chronos trigger",
  "chrono trigger",
  "link to the past",
  "donkey kong country",
  "nhl '94",
  "nhl 94",
  "earthbound",
  "secret of mana",
  "super castlevania",
  "final fantasy vi",
];

const PS1 = [
  "gran turismo 2",
  "crash bash",
  "ctr:",
  "high-octane",
  "wipeout",
  "tomb raider",
  "metal gear solid",
  "crash bandicoot",
  "spyro",
  "symphony of the night",
  "final fantasy vii",
  "oddworld",
  "mediEvil",
  "driver 2",
  "tekken 3",
];

const PS2 = [
  "budokai",
  "vice city",
  "san andreas",
  "most wanted",
  "underground 2",
  "midnight club",
  "flatout",
  "burnout 3",
  "gran turismo 4",
  "here comes the pain",
  "smackdown vs. raw",
  "smackdown vs raw",
  "shaolin monks",
  "armageddon",
  "def jam",
  "fifa street",
  "pes 6",
  "pes 2011",
  "pes 2014",
  "pro evolution soccer",
  "hit & run",
  "hit and run",
  "need for speed: carbon",
  "need for speed carbon",
  "grand theft auto iii",
  "gta 3",
  "gta iii",
  "marvel vs. capcom 2",
  "marvel vs capcom 2",
  "resident evil outbreak",
  "ratchet & clank",
  "ratchet and clank",
  "chain of memories",
  "god of war",
  "shadow of the colossus",
  "kingdom hearts ii",
];

const ARCADE = [
  "pac-man",
  "pacman",
  "battle city",
  "daytona usa",
  "virtua fighter",
  "super monkey ball",
  "metal slug",
  "galaga",
  "space invaders",
];

const WEB_NATIVE = [
  "tetris",
  "2048",
  "wordle",
  "flappy",
  "chrome dino",
  "google snake",
  "cookie clicker",
  "candy crush",
  "little alchemy",
  "skribbl",
  "chess.com",
  "lichess",
  "krunker",
  "diep.io",
  "slither",
  "hole.io",
  "haxball",
  "paperclips",
  "crossy road",
  "doodle jump",
  "slope",
  "tunnel rush",
  "retro bowl",
  "suika",
  "jstris",
  "generals.io",
  "florr.io",
  "arras.io",
  "powerline",
  "zombs.io",
  "shell shockers",
  "bad ice-cream",
  "impossible quiz",
  "dumb ways",
  "drift boss",
  "snow rider",
  "escape road",
  "rooftop snipers",
  "getaway shootout",
  "house of hazards",
  "tiny fishing",
  "learn to fly",
  "vex 5",
  "red ball",
  "run 3",
  "ovo",
  "polytrack",
  "basketball stars",
  "stickman hook",
  "the world's hardest game",
  "sort the court",
  "we become what we behold",
  "captchaware",
];

const PC_TITLES = [
  "half-life",
  "counter-strike",
  "cs surf",
  "quake",
  "doom",
  "unreal tournament",
  "portal",
  "return to castle",
  "wolfenstein",
  "minecraft",
  "hollow knight",
  "silksong",
  "celeste",
  "ultrakill",
  "cuphead",
  "undertale",
  "deltarune",
  "terraria",
  "rimworld",
  "geometry dash",
  "five nights",
  "fnaf",
  "freddy",
  "osu!",
  "friday night funkin",
  "papers, please",
  "binding of isaac",
  "hotline miami",
  "spelunky",
  "cave story",
  "pizza tower",
  "superhot",
  "slime rancher",
  "raft",
  "fallout",
  "morrowind",
  "diablo",
  "command & conquer",
  "command and conquer",
  "rollercoaster tycoon",
  "duke nukem",
  "heretic",
  "hexen",
  "descent",
  "tyrian",
  "openttd",
  "x-com",
  "heroes of might",
  "dune ii",
  "caesar",
  "freeciv",
  "homeworld",
  "planescape",
  "arx fatalis",
  "postal",
  "brutal doom",
  "freedoom",
  "team fortress",
  "inscryption",
  "vampire survivors",
  "brotato",
  "people playground",
  "lethal company",
  "r.e.p.o",
  "ravenfield",
  "yandere",
  "worldbox",
  "mindustry",
  "shapez",
  "ftl:",
  "stardew",
  "hades",
  "celeste",
  "omori",
  "oneShot",
  "fez",
  "getting over it",
  "clustertruck",
  "trombon",
  "dev jam",
  "guitar hero",
  "skate 3",
  "skate rust",
  "call of duty",
  "black ops",
  "modern warfare",
  "halo",
  "grand theft auto v",
  "gta 5",
  "gta v",
  "grand theft auto 2",
  "left 4 dead",
  "bioshock",
  "crysis",
  "elder scrolls",
  "stalker",
  "s.t.a.l.k.e.r",
  "ammo",
  "ultrakill",
  "doki doki",
  "bendy",
  "poppy",
  "fears to fathom",
  "iron lung",
  "buckshot",
  "content warning",
  "lethal",
  "repo",
  "peak",
  "web fishing",
  "webfishing",
  "gorillatag",
  "gorilla tag",
  "krunker",
];

const HEAVY_3D = [
  "grand theft auto",
  "gta ",
  "gta:",
  "minecraft",
  "call of duty",
  "black ops",
  "modern warfare",
  "halo",
  "need for speed",
  "gran turismo",
  "burnout",
  "midnight club",
  "skate 3",
  "skate rust",
  "morrowind",
  "portal",
  "half-life",
  "counter-strike",
  "quake 3",
  "quake iii",
  "return to castle",
  "unreal tournament",
  "doom 3",
  "goldeneye",
  "perfect dark",
  "mario 64",
  "twilight princess",
  "animal crossing",
  "ratchet",
  "kingdom hearts",
  "jedi",
  "budokai",
  "tekken",
  "mortal kombat",
  "def jam",
  "smackdown",
  "wwe ",
  "fifa ",
  "pes ",
  "pro evolution",
  "naruto",
  "resident evil",
  "silent hill",
  "team fortress",
  "ultrakill",
  "lethal company",
  "r.e.p.o",
  "ravenfield",
  "yandere simulator",
  "superhot",
  "hit & run",
  "flatout",
  "crash team racing",
  "ctr:",
  "diddy kong",
  "daytona",
  "wipeout",
  "super monkey ball",
  "sonic robo blast 2",
  "gorilla tag",
  "people playground",
  "gta 5",
  "gta v",
  "vice city",
  "san andreas",
  "black ops",
  "most wanted",
];

const LIGHT_NAMES = [
  "tetris",
  "2048",
  "wordle",
  "flappy",
  "chrome dino",
  "google snake",
  "pac-man",
  "cookie clicker",
  "candy crush",
  "little alchemy",
  "skribbl",
  "chess",
  "lichess",
  "paperclips",
  "crossy road",
  "doodle jump",
  "slope",
  "tunnel rush",
  "retro bowl",
  "suika",
  "diep.io",
  "slither",
  "hole.io",
  "haxball",
  "krunker",
  "shell shockers",
  "zombs.io",
  "bad ice-cream",
  "impossible quiz",
  "dumb ways",
  "drift boss",
  "rooftop snipers",
  "getaway shootout",
  "house of hazards",
  "tiny fishing",
  "run 3",
  "red ball",
  "vex 5",
  "stickman hook",
  "world's hardest",
  "sort the court",
  "jstris",
  "powerline",
  "florr.io",
  "arras.io",
  "generals.io",
  "escape road",
  "snow rider",
  "learn to fly",
  "basketball stars",
  "ovo",
  "captchaware",
  "cut the rope",
  "fireboy and watergirl",
  "there is no game",
];

const TOUCH_ONLY = ["temple run", "fruit ninja", "pou", "talking baby", "crossy road", "flappy bird"];

const MULTIPLAYER_HOSTS = new Set([
  "krunker.io",
  "diep.io",
  "slither.io",
  "shellshock.io",
  "zombs.io",
  "zombsroyale.io",
  "www.haxball.com",
  "haxball.com",
  "arras.io",
  "generals.io",
  "jstris.jezevec10.com",
  "lichess.org",
  "www.chess.com",
  "chess.com",
  "warbrokers.io",
  "ev.io",
  "kirka.io",
  "suroi.io",
  "narrow.one",
  "voxiom.io",
  "evowars.io",
  "veck.io",
  "bloxd.io",
  "taming.io",
  "starve.io",
  "skribbl.io",
  "openfront.io",
  "florr.io",
  "venge.io",
  "shellshock.io",
]);

const HEAVY_HOST = /wasmarcade|virtastic|recompiledgames|fiveplay|emulatorjs|dos\.zone|gn-math\.dev|wasm\.rip|playtab\.fun/;

const ALIAS_GROUPS = [
  ["mario", "super mario", "sm64"],
  ["zelda", "legend of zelda"],
  ["cod", "call of duty", "black ops", "modern warfare", "mw2", "bo2"],
  ["gta", "grand theft auto", "vice city"],
  ["nfs", "need for speed"],
  ["cs", "counter-strike", "counter strike"],
  ["fnaf", "five nights", "freddy"],
  ["dbz", "dragon ball", "budokai"],
  ["mk", "mortal kombat"],
  ["pes", "pro evolution", "winning eleven"],
  ["pokemon", "pokémon", "poke"],
  ["smash", "super smash"],
  ["minecraft", "mc"],
  ["halo"],
  ["sonic"],
  ["doom"],
  ["quake"],
  ["tetris"],
  ["ff", "final fantasy"],
  ["re", "resident evil"],
  ["sh", "silent hill"],
  ["kh", "kingdom hearts"],
  ["ac", "animal crossing"],
  ["gt", "gran turismo"],
  ["mvs", "marvel vs capcom", "marvel vs. capcom"],
];

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function includesAny(name: string, phrases: string[]): boolean {
  const n = normalize(name);
  return phrases.some((phrase) => n.includes(normalize(phrase)));
}

function platformOf(name: string, category: string, host: string): Platform {
  if (includesAny(name, PSP)) return "PSP";
  if (name === "Super Smash Bros." || includesAny(name, N64.filter((item) => item !== "super smash bros.")))
    return "N64";
  if (includesAny(name, SNES)) return "SNES";
  if (includesAny(name, PS1) && !includesAny(name, ["tomb raider"])) return "PS1";
  if (/^tomb raider$/i.test(name) || /openlara/i.test(host)) return "PS1";
  if (includesAny(name, PS2) && !includesAny(name, ["ultimate ninja impact", "silent hill: origins"])) return "PS2";
  if (includesAny(name, ARCADE) && !includesAny(name, PC_TITLES)) return "Arcade";
  if (includesAny(name, WEB_NATIVE) || /lichess|tetris\.com|chromedino|neal\.fun|littlealchemy|skribbl|haxball|diep\.io|krunker/i.test(host))
    return "Web";
  if (includesAny(name, PC_TITLES)) return "PC";
  return "Web";
}

function perfOf(name: string, category: string, host: string): Perf {
  const light = includesAny(name, LIGHT_NAMES) || ["Puzzle", "Arcade", "Casual"].includes(category);
  const heavyName = includesAny(name, HEAVY_3D);
  const heavyHost = HEAVY_HOST.test(host);
  if (light && !heavyName) return "leve";
  if (heavyName) return "pesado";
  if (heavyHost && ["Tiro", "Ação", "Aventura", "Corrida", "Luta", "RPG"].includes(category)) return "pesado";
  if (heavyHost) return "medio";
  return "medio";
}

/**
 * Session length is an estimate, not an official time-to-beat.
 * Mobile sessions cluster around 3–8 minutes; PC sessions around 18
 * (GameAnalytics benchmarks, summarized by KiwiBox, 2025). Puzzle, racing
 * and sports tend to resolve in short rounds; RPG and strategy do not.
 */
function durationOf(name: string, category: string, perf: Perf): { band: DurationBand; minuteFit: 5 | 10 | 15 | null } {
  if (includesAny(name, LIGHT_NAMES) || ["Arcade", "Puzzle", "Casual"].includes(category)) {
    if (includesAny(name, ["cookie clicker", "universal paperclips", "little alchemy"])) {
      return { band: "longo", minuteFit: null };
    }
    return { band: "curto", minuteFit: 5 };
  }
  if (category === "Terror" && /freddy|fnaf|five nights/i.test(name)) return { band: "curto", minuteFit: 10 };
  if (includesAny(name, ["minecraft", "morrowind", "rimworld", "animal crossing", "the sims", "simcity"])) {
    return { band: "longo", minuteFit: null };
  }
  if (["Corrida", "Esportes", "Luta", "Música"].includes(category)) return { band: "medio", minuteFit: 10 };
  if (["RPG", "Estratégia", "Simulação"].includes(category)) return { band: "longo", minuteFit: null };
  if (["Tiro", "Zumbis", "Ação", "Plataforma", "Aventura", "Terror"].includes(category)) return { band: "medio", minuteFit: 15 };
  return { band: "medio", minuteFit: 15 };
}

function aliasesFor(name: string): string[] {
  const n = normalize(name);
  const extra = new Set<string>();
  for (const group of ALIAS_GROUPS) {
    if (group.some((token) => n.includes(normalize(token)))) {
      for (const token of group) extra.add(normalize(token));
    }
  }
  return [...extra];
}

function decade(platform: Platform): string {
  if (platform === "Arcade") return "1980 1990";
  if (platform === "SNES" || platform === "PS1") return "1990";
  if (platform === "N64" || platform === "PS2" || platform === "PSP") return "2000";
  return "";
}

export function classify(input: {
  name: string;
  category: string;
  host: string;
  url: string;
  score: number | null;
}): Classified {
  const platform = platformOf(input.name, input.category, input.host);
  let perf = perfOf(input.name, input.category, input.host);
  if (platform === "Web" && includesAny(input.name, LIGHT_NAMES)) perf = "leve";
  if (["PS1", "PS2", "PSP", "N64"].includes(platform) && perf === "leve" && !includesAny(input.name, LIGHT_NAMES)) perf = "medio";
  const duration = durationOf(input.name, input.category, perf);
  const hasUrl = Boolean(input.url);
  const heavyHost = HEAVY_HOST.test(input.host);
  const tags = new Set<TagId>();
  if (["SNES", "N64", "PS1", "PS2", "PSP", "Arcade"].includes(platform)) tags.add("retro");
  if (duration.band === "curto") tags.add("rapido");
  if (perf === "leve") tags.add("leve");
  if (input.category === "Terror") tags.add("terror");
  if ((input.score != null && input.score >= 90) || ["SNES", "N64", "PS1", "Arcade"].includes(platform)) tags.add("classico");
  if (platform === "PC") tags.add("pc");
  if (/mobile|pocket edition|\blite\b/i.test(input.name) || includesAny(input.name, TOUCH_ONLY)) tags.add("mobile");
  const multiplayer =
    /online|multiplayer|co-?op|versus|1v1|royale/i.test(input.name) || MULTIPLAYER_HOSTS.has(input.host);
  if (multiplayer) tags.add("multiplayer");

  const keyboard = !includesAny(input.name, TOUCH_ONLY);
  const gamepad = ["Corrida", "Luta", "Esportes", "Plataforma", "Tiro", "Ação"].includes(input.category) || perf === "pesado";
  const chromebook = hasUrl && (perf === "leve" || (perf === "medio" && !heavyHost));
  const linux = hasUrl;

  const searchExtra = [
    platform,
    input.category,
    input.host,
    perf,
    duration.band,
    ...tags,
    ...aliasesFor(input.name),
    decade(platform),
    chromebook ? "chromebook" : "",
    linux ? "linux" : "",
    keyboard ? "teclado mouse" : "",
    gamepad ? "controle" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    platform,
    perf,
    duration: duration.band,
    minuteFit: duration.minuteFit,
    tags: [...tags],
    devices: { web: hasUrl, chromebook, linux, keyboard, gamepad },
    searchExtra,
  };
}

export const PERF_COPY: Record<Perf | "desconhecido", { title: string; body: string }> = {
  leve: { title: "Leve", body: "Estimativa. Recomendado para dispositivos básicos." },
  medio: { title: "Médio", body: "Estimativa. Roda melhor com um pouco mais de folga de memória." },
  pesado: { title: "Pesado", body: "Estimativa. Emulador 3D ou jogo de PC exigente. Pode travar em máquina fraca." },
  desconhecido: { title: "Desconhecido", body: "Sem dado suficiente para estimar o peso deste jogo." },
};

export const DURATION_COPY: Record<DurationBand, string> = {
  curto: "Sessão curta estimada, em torno de 5 minutos. Não é o tempo oficial do jogo.",
  medio: "Partida média estimada, cerca de 10 a 15 minutos.",
  longo: "Sessão longa estimada. RPG, estratégia ou campanha não cabem num intervalo curto.",
};
