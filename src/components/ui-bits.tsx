export function chipClass(active: boolean) {
  return `inline-flex h-11 shrink-0 items-center rounded-full border px-3 text-sm font-semibold ${
    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
  }`;
}

export function perfLabel(perf: "leve" | "medio" | "pesado") {
  if (perf === "leve") return "Leve";
  if (perf === "medio") return "Médio";
  return "Pesado";
}
