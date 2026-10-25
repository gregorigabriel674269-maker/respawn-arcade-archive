import * as Dialog from "@radix-ui/react-dialog";
import {
  ExternalLink,
  Keyboard,
  Maximize,
  Minimize,
  RotateCcw,
  Send,
  Star,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GameComments } from '@/components/game-comments';
import { GAME_SANDBOX, PLAYER_LOAD_TIMEOUT_MS, safeGameUrl } from "@/lib/player-safety";
import { controlHints, type Game } from "@/lib/catalog";
import { usePlayerSession } from "@/components/player-session";
import {
  getCommunitySnapshot,
  getServerCommunitySnapshot,
  rateGame,
  recordPlay,
  rememberPlay,
  saveFeedback,
  subscribeCommunity,
  userRating,
} from "@/lib/community";

const openedAt = new Map<string, number>();

function shouldCountOpen(name: string) {
  const now = Date.now();
  const previous = openedAt.get(name) ?? 0;
  if (now - previous < 1200) return false;
  openedAt.set(name, now);
  return true;
}

export function GamePlayer({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { user, openAuth } = usePlayerSession();
  const community = useSyncExternalStore(subscribeCommunity, getCommunitySnapshot, getServerCommunitySnapshot);
  const [phase, setPhase] = useState<"loading" | "start" | "play" | "error">("loading");

  const [line, setLine] = useState(0);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;
  const gameUrl = game ? safeGameUrl(game.url) : null;

  useEffect(() => {
    setPhase(gameUrl ? "loading" : "error");

    setLine(0);
    setControlsOpen(false);
    setFeedback("");
    if (!game || !gameUrl) return;
    if (!shouldCountOpen(game.name)) return;
    rememberPlay(game.name);
    recordPlay(game.name, userRef.current);
  }, [game?.name, gameUrl, reloadKey]);

  useEffect(() => {
    if (phase !== "loading") return;

    const lineTimer = window.setInterval(() => setLine((value) => (value + 1) % 3), 900);
    const failTimer = window.setTimeout(() => setPhase("error"), PLAYER_LOAD_TIMEOUT_MS);
    return () => {

      window.clearInterval(lineTimer);
      window.clearTimeout(failTimer);
    };
  }, [phase, game?.name, reloadKey]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current?.requestFullscreen();
    } catch {
      toast.error("Tela cheia não está disponível neste navegador.");
    }
  }

  const rating = game && user ? userRating(community, game.name, user.id) : 0;
  const hints = game ? controlHints(game.category) : [];

  return (
    <Dialog.Root
      open={Boolean(game)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(event) => {
            if (document.fullscreenElement) event.preventDefault();
          }}
          className="fixed top-1/2 left-1/2 z-50 max-h-[95dvh] w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-2xl sm:p-5"
        >
          {game ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 pr-8">
                <Dialog.Title className="font-display min-w-0 text-2xl font-bold break-words">
                  {game.name}
                </Dialog.Title>
                <span className="text-xs text-muted-foreground">{game.category}</span>
              </div>
              <Dialog.Close
                aria-label="Fechar"
                className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>

              <div ref={stageRef} className="flex flex-col bg-background" aria-label="Área do jogo">
                <div className="flex flex-wrap items-center gap-2 border-b border-border py-2">
                  <Button
                    type="button"
                    title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                    aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                    onClick={() => void toggleFullscreen()}
                    className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    title="Reiniciar jogo"
                    aria-label="Reiniciar jogo"
                    onClick={() => {
                      setReloadKey((value) => value + 1);
                      setPhase("loading");
                    }}
                    className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    title="Controles"
                    aria-label="Controles"
                    aria-pressed={controlsOpen}
                    onClick={() => setControlsOpen((value) => !value)}
                    className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <Keyboard className="h-4 w-4" />
                  </Button>
                  {gameUrl ? (
                    <a
                      href={gameUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex h-8 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir no site original
                    </a>
                  ) : null}
                </div>
                <div className={fullscreen ? "relative min-h-0 flex-1" : "relative aspect-video min-h-64"}>
                  {gameUrl && phase !== "play" ? (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-background p-6 text-center">
                      {phase === "error" ? (
                        <div>
                          <p className="font-display text-3xl font-bold">Ops!</p>
                          <p className="mt-2 text-sm text-muted-foreground">O jogo demorou ou pode bloquear a abertura aqui.</p>
                          <Button asChild className="mt-3"><a href={gameUrl} target="_blank" rel="noopener noreferrer">Abrir no site original</a></Button>
                          <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <Button
                              type="button"
                              onClick={() => {
                                setReloadKey((value) => value + 1);
                                setPhase("loading");
                              }}
                              className="h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
                            >
                              Tentar novamente
                            </Button>
                            <Button type="button" onClick={onClose} className="h-11 rounded-full border border-border px-4 text-sm font-semibold">
                              Voltar aos jogos
                            </Button>
                          </div>
                        </div>
                      ) : phase === "start" ? (
                        <div>
                          <p className="font-display text-2xl font-bold">Abrir {game.name}</p>
                          <p className="mt-2 max-w-md text-sm text-muted-foreground">O navegador não confirma se o site permite jogar aqui. Se a tela ficar vazia, abra no site original.</p>
                          <Button
                            type="button"
                            onClick={() => {
                              setPhase("play");
                              frameRef.current?.focus();
                            }}
                            className="mt-4 h-12 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground"
                          >
                            Exibir jogo
                          </Button>
                          <Button asChild variant="secondary" className="mt-3"><a href={gameUrl} target="_blank" rel="noopener noreferrer">Abrir no site original</a></Button>
                        </div>
                      ) : (
                        <div className="w-full max-w-sm">
                          <p className="font-display text-3xl font-bold">RESPAWN</p>
                          <p className="mt-2 text-sm text-muted-foreground">Inicializando jogo...</p>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label="Aguardando resposta do site do jogo">
                            <div className="h-full bg-primary"  />
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground">
                            {["Abrindo o site do jogo…", "Aguardando resposta…", "Verificando carregamento…"][line]}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null}
                  {gameUrl ? (
                    <iframe
                      key={`${game.name}-${reloadKey}`}
                      ref={frameRef}
                      title={`Jogar ${game.name}`}
                      src={gameUrl}
                      className="absolute inset-0 h-full w-full border-0"
                      allow="fullscreen; autoplay; gamepad"
                      allowFullScreen
                      sandbox={GAME_SANDBOX}
                      referrerPolicy="no-referrer"
                      onLoad={() => {

                        // onLoad also fires for CSP/X-Frame-Options failures; never claim playability.
                        setPhase((current) => current === "loading" ? "start" : current);
                      }}
                      onError={() => setPhase("error")}
                    />
                  ) : (
                    <p className="grid h-full place-items-center px-6 text-center text-muted-foreground">
                      Temporariamente indisponível
                    </p>
                  )}
                </div>
                {controlsOpen ? (
                  <div className="space-y-2 border-t border-border p-3 text-sm">
                    <h3 className="font-semibold">Controles de gameplay</h3>
                    {hints.map((hint) => (
                      <div key={hint.keys} className="flex flex-wrap gap-3">
                        <kbd className="font-mono text-primary">{hint.keys}</kbd>
                        <span>{hint.action}</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Os comandos dependem da versão. Confira os controles dentro do jogo.
                    </p>
                    <Button
                      type="button"
                      onClick={() => frameRef.current?.focus()}
                      className="h-8 rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground"
                    >
                      Focar no jogo
                    </Button>
                  </div>
                ) : null}
              </div>

              {gameUrl ? <p role="status" className="text-sm text-warn">Tela vazia ou jogo bloqueado? <a className="underline" href={gameUrl} target="_blank" rel="noopener noreferrer">Abrir no site original</a></p> : null}

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">Sua avaliação</span>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    title={`${value} estrela${value === 1 ? "" : "s"}`}
                    aria-label={`Avaliar ${value} estrelas`}
                    disabled={busy}
                    onClick={async () => {
                      if (!user) {
                        openAuth();
                        return;
                      }
                      setBusy(true);
                      try {
                        await rateGame(game.name, user.id, value);
                        toast.success("Avaliação salva.");
                      } catch {
                        toast.error("Não foi possível salvar a avaliação.");
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent"
                  >
                    <Star className={value <= rating ? "fill-primary text-primary" : "text-muted-foreground"} />
                  </Button>
                ))}
              </div>

              {user ? (
                <form
                  className="flex gap-2"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setBusy(true);
                    try {
                      await saveFeedback(game.name, user.id, feedback);
                      setFeedback("");
                      toast.success("Feedback enviado.");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o feedback.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <textarea
                    aria-label="Feedback sobre o jogo"
                    placeholder="Seu feedback sobre o jogo…"
                    minLength={5}
                    maxLength={1000}
                    required
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    className="min-w-0 flex-1 rounded-md border border-border bg-background p-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    type="submit"
                    title="Enviar feedback"
                    aria-label="Enviar feedback"
                    disabled={busy}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button type="button" variant="ghost" onClick={openAuth} className="text-sm font-medium text-primary hover:underline">
                  Entrar para avaliar e enviar feedback
                </Button>
              )}
              <GameComments gameName={game.name}/>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
