import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Send, ThumbsUp } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { usePlayerSession } from "@/components/player-session";
import { PortalNav } from "@/components/portal-nav";
import {
  addRequest,
  communityView,
  getCommunitySnapshot,
  getServerCommunitySnapshot,
  subscribeCommunity,
  toggleRequestVote,
} from "@/lib/community";

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [{ title: "Mural de pedidos de jogos — Respawn" },
      { name: "description", content: "Sugira jogos e acompanhe os pedidos da comunidade Respawn." },
      { property: "og:title", content: "Mural de pedidos de jogos — Respawn" },
      { property: "og:description", content: "Pedidos e sugestões da comunidade Respawn para o catálogo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const state = useSyncExternalStore(subscribeCommunity, getCommunitySnapshot, getServerCommunitySnapshot);
  const { requests } = communityView(state);
  const { user, openAuth } = usePlayerSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen">
      <PortalNav current="pedidos" />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="flex items-center gap-3 font-display text-3xl font-bold">
          <MessageSquare className="text-primary" aria-hidden="true" />
          Pedidos da comunidade
        </h1>
        {user ? (
          <form
            className="my-8 space-y-3 border-y border-border py-6"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              try {
                await addRequest({
                  title,
                  description,
                  userId: user.id,
                  displayName: user.displayName,
                });
                setTitle("");
                setDescription("");
                toast.success("Pedido publicado.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Não foi possível publicar.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="block text-sm">
              Título do jogo
              <input
                className="mt-1 w-full rounded-md border border-border bg-card p-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
            </label>
            <label className="block text-sm">
              Comentário
              <textarea
                className="mt-1 w-full rounded-md border border-border bg-card p-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Publicar pedido
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={openAuth}
            className="my-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Entrar para sugerir um jogo
          </button>
        )}
        <div className="divide-y divide-border">
          {requests.map((request,index) => {
            const voted = user ? request.voterIds.includes(user.id) : false;
            return (
              <article key={request.id} className="flex gap-4 py-5">
                <button
                  type="button"
                  aria-label={`Votar em ${request.title}`}
                  aria-pressed={voted}
                  disabled={busy}
                  onClick={() => {
                    if (!user) {
                      openAuth();
                      return;
                    }
                    setBusy(true);
                    void toggleRequestVote(request.id,user.id).catch(()=>toast.error("Não foi possível votar.")).finally(()=>setBusy(false));
                  }}
                  className={`flex h-auto flex-col items-center self-start rounded-md border px-3 py-2 text-sm ${voted ? "border-transparent bg-secondary" : "border-border hover:bg-accent"}`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{request.votes}</span>
                </button>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold break-words">{index+1}. {request.title}</h2><p className="mt-1 text-xs text-primary">{{open:"Aberto",review:"Em análise",resolved:"Resolvido",rejected:"Rejeitado"}[request.status ?? "open"] ?? "Aberto"}</p>
                  {request.description ? (
                    <p className="mt-1 text-sm break-words whitespace-pre-wrap text-muted-foreground">
                      {request.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {request.displayName} ·{" "}
                    {new Date(request.createdAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
        {requests.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">Nenhum pedido ainda.</p>
        ) : null}
      </main>
    </div>
  );
}
