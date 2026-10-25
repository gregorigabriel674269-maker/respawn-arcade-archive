import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Respawn — Descubra seus próximos jogos" },
    { name: "description", content: "Descubra jogos do Respawn, capas originais, favoritos e sugestões para sua próxima partida." },
    { property: "og:title", content: "Respawn — Descubra seus próximos jogos" },
    { property: "og:description", content: "Jogos da semana, favoritos e descobertas no catálogo Respawn." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HomePage,
});
