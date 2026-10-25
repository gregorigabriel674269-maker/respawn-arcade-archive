import { PrefsForm } from "@/components/prefs-form";
import { updatePrefs, usePrefs } from "@/lib/prefs";

export function SettingsPanel() {
  const prefs = usePrefs();
  return (
    <div className="space-y-4">
      <PrefsForm />
      <div className="space-y-2 border-t border-border pt-4">
        <button
          type="button"
          aria-pressed={prefs.school}
          onClick={() => updatePrefs({ school: !prefs.school, ultra: prefs.school ? false : prefs.ultra })}
          className={`h-11 w-full rounded-full text-sm font-semibold ${prefs.school ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          {prefs.school ? "Modo escola ligado" : "Ligar modo escola"}
        </button>
        <button
          type="button"
          aria-pressed={prefs.school && prefs.ultra}
          disabled={!prefs.school}
          onClick={() => updatePrefs({ ultra: !prefs.ultra })}
          className="h-11 w-full rounded-full bg-secondary text-sm font-semibold text-secondary-foreground disabled:opacity-50"
        >
          {prefs.school && prefs.ultra ? "Ultra leve ligado" : "Ultra leve"}
        </button>
        <p className="text-xs text-muted-foreground">
          Modo escola reduz animação, sombra e a quantidade de cards. Ultra leve também não baixa as capas. Não altera bloqueios nem a rede da escola.
        </p>
      </div>
    </div>
  );
}
