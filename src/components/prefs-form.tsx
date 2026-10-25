import { updatePrefs, usePrefs, type AccentPref, type CardSize, type LayoutPref, type ThemePref } from "@/lib/prefs";

const ACCENTS: { id: AccentPref; label: string; className: string }[] = [
  { id: "lime", label: "Verde", className: "swatch-lime" },
  { id: "teal", label: "Teal", className: "swatch-teal" },
  { id: "amber", label: "Âmbar", className: "swatch-amber" },
  { id: "rose", label: "Rosa", className: "swatch-rose" },
];

export function PrefsForm() {
  const prefs = usePrefs();
  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground">Tema</legend>
        <div className="mt-1 flex gap-2">
          {(["dark", "light", "auto"] as ThemePref[]).map((theme) => (
            <button key={theme} type="button" aria-pressed={prefs.theme === theme} onClick={() => updatePrefs({ theme })} className={`h-10 flex-1 rounded-full text-xs font-semibold ${prefs.theme === theme ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {theme === "dark" ? "Escuro" : theme === "light" ? "Claro" : "Auto"}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground">Cor de destaque</legend>
        <div className="mt-1 flex gap-2">
          {ACCENTS.map((accent) => (
            <button key={accent.id} type="button" aria-label={accent.label} aria-pressed={prefs.accent === accent.id} onClick={() => updatePrefs({ accent: accent.id })} className={`h-10 w-10 rounded-full border border-border ${accent.className}`} />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground">Cards</legend>
        <div className="mt-1 flex gap-2">
          {(["lg", "md", "sm"] as CardSize[]).map((size) => (
            <button key={size} type="button" aria-pressed={prefs.cardSize === size} onClick={() => updatePrefs({ cardSize: size })} className={`h-10 flex-1 rounded-full text-xs font-semibold ${prefs.cardSize === size ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {size === "lg" ? "Grande" : size === "md" ? "Médio" : "Pequeno"}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground">Layout</legend>
        <div className="mt-1 flex gap-2">
          {(["normal", "compact", "minimal"] as LayoutPref[]).map((layout) => (
            <button key={layout} type="button" aria-pressed={prefs.layout === layout} onClick={() => updatePrefs({ layout })} className={`h-10 flex-1 rounded-full text-xs font-semibold ${prefs.layout === layout ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {layout === "normal" ? "Normal" : layout === "compact" ? "Compacto" : "Mínimo"}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
