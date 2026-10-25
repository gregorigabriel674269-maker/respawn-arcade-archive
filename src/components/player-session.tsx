import * as Dialog from "@radix-ui/react-dialog";
import { Camera, LogOut, UserRound, X } from "lucide-react";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { toast } from "sonner";
import {
  getAuthSnapshot,
  getServerAuthSnapshot,
  resetPassword,
  refreshAccount,
  clearAccount,
  signIn,
  signOut,
  signUp,
  subscribeAuth,
  updateProfile,
  type PublicUser,
} from "@/lib/account";
import { syncLeaderboardPlayer, refreshCommunity, syncLibrary, clearLibrary, clearPrivateCommunity } from "@/lib/community";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type SessionValue = {
  user: PublicUser | null;
  openAuth: () => void;
  openProfile: () => void;
};

const SessionContext = createContext<SessionValue>({
  user: null,
  openAuth: () => {},
  openProfile: () => {},
});

export function usePlayerSession() {
  return useContext(SessionContext);
}

const fieldClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function PlayerSessionProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    void refreshAccount().then(() => refreshCommunity());
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      clearPrivateCommunity();
      if (event === "SIGNED_OUT") { queryClient.clear(); clearLibrary(); clearAccount(); }
      window.setTimeout(() => { void refreshAccount().then(() => refreshCommunity()); void router.invalidate(); if (event !== "SIGNED_OUT") void queryClient.invalidateQueries(); }, 0);
    });
    const onFocus = () => { void refreshCommunity(); if (getAuthSnapshot()) void syncLibrary(); };
    window.addEventListener('focus', onFocus);
    return () => { subscription.unsubscribe(); window.removeEventListener('focus', onFocus); };
  }, [queryClient, router]);
  useEffect(() => { if (user) { void syncLibrary(); setAuthOpen(false); } }, [user?.id]);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <SessionContext.Provider
      value={{
        user,
        openAuth: () => setAuthOpen(true),
        openProfile: () => setProfileOpen(true),
      }}
    >
      {children}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <ProfileDialog open={profileOpen && Boolean(user)} onOpenChange={setProfileOpen} user={user} />
    </SessionContext.Provider>
  );
}

export function AccountButton() {
  const { user, openAuth, openProfile } = usePlayerSession();
  return (
    <Button
      type="button"
      onClick={() => (user ? openProfile() : openAuth())}
      className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium"
    >
      <UserRound className="h-4 w-4" />
      <span>{user ? "Minha conta" : "Entrar"}</span>
    </Button>
  );
}

function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  function switchMode(next: "login" | "signup" | "forgot") {
    setMode(next);
    setStatus("");
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-2xl">
          <Dialog.Title className="font-display pr-8 text-2xl font-bold">Conta de jogador</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            Entre para avaliar jogos, enviar feedback e participar dos rankings.
          </Dialog.Description>
          <Dialog.Close
            aria-label="Fechar"
            className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-md hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => switchMode("login")}
                className={`h-8 rounded-md px-3 text-sm font-medium ${mode === "login" || mode === "forgot" ? "bg-secondary" : "hover:bg-accent"}`}
              >
                Entrar
              </Button>
              <Button
                type="button"
                onClick={() => switchMode("signup")}
                className={`h-8 rounded-md px-3 text-sm font-medium ${mode === "signup" ? "bg-secondary" : "hover:bg-accent"}`}
              >
                Criar conta
              </Button>
            </div>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                setBusy(true);
                setStatus("");
                void (async () => {
                  try {
                    if (mode === "forgot") {
                      await resetPassword(email);
                      setStatus("Se a conta existir, você receberá um link para redefinir sua senha.");
                      return;
                    }
                    if (mode === "signup") {
                      const active = await signUp({ email, password, displayName });
                      setStatus(active ? "Conta criada." : "Confira seu email para confirmar a conta antes de entrar.");
                      if (active) onOpenChange(false);
                      return;
                    }
                    await signIn({ email, password });
                    onOpenChange(false);
                  } catch (error) {
                    setStatus(
                      error instanceof Error
                        ? error.message
                        : "Não foi possível concluir. Confira seus dados e tente novamente.",
                    );
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            >
              {mode === "signup" ? (
                <label className="block text-sm">
                  Nome público
                  <input
                    className={fieldClass}
                    required
                    minLength={2}
                    maxLength={50}
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    autoComplete="nickname"
                  />
                </label>
              ) : null}
              <label className="block text-sm">
                Email
                <input
                  type="email"
                  className={fieldClass}
                  required
                  maxLength={255}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </label>
              {mode !== "forgot" ? (
                <label className="block text-sm">
                  Senha
                  <input
                    type="password"
                    className={fieldClass}
                    required
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                </label>
              ) : null}
              <Button
                type="submit"
                disabled={busy}
                className="h-9 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {busy
                  ? "Aguarde…"
                  : mode === "signup"
                    ? "Criar conta"
                    : mode === "forgot"
                      ? "Continuar"
                      : "Entrar"}
              </Button>
            </form>
            {mode !== "forgot" ? <div className="grid gap-2">
              <Button variant="secondary" disabled={busy} onClick={async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }); if (error) setStatus("Entrar com Google ainda não está ativado neste site."); }}>Continuar com Google</Button>
            </div> : null}
            {mode === "login" ? (
              <Button type="button" onClick={() => switchMode("forgot")} className="text-sm text-primary hover:underline">
                Esqueci minha senha
              </Button>
            ) : null}
            {status ? (
              <p role="status" className="text-sm text-muted-foreground">
                {status}
              </p>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProfileDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PublicUser | null;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.displayName ?? "");
  const [leaderboard, setLeaderboard] = useState(user?.leaderboardEnabled ?? false);
  const [avatar, setAvatar] = useState<string | null>(user?.avatarDataUrl ?? null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setName(user.displayName);
    setLeaderboard(user.leaderboardEnabled);
    setAvatar(user.avatarDataUrl);
  }, [open, user]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next && user) {
          setName(user.displayName);
          setLeaderboard(user.leaderboardEnabled);
          setAvatar(user.avatarDataUrl);
        }
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-2xl">
          <Dialog.Title className="font-display pr-8 text-2xl font-bold">Meu perfil</Dialog.Title>
          <Dialog.Description className="sr-only">Edite seu nome, avatar e participação no ranking.</Dialog.Description>
          <Dialog.Close aria-label="Fechar" className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-md hover:bg-accent">
            <X className="h-4 w-4" />
          </Dialog.Close>
          {user ? (
            <form
              className="mt-4 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                try {
                  const saved = await updateProfile(user.id, {
                    displayName: name,
                    leaderboardEnabled: leaderboard,
                    avatarDataUrl: avatar,
                  });
                  if (saved) {
                    syncLeaderboardPlayer({
                      id: saved.id,
                      displayName: saved.displayName,
                      avatarDataUrl: saved.avatarDataUrl,
                      leaderboardEnabled: saved.leaderboardEnabled,
                    });
                  }
                  toast.success("Perfil salvo.");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Não foi possível salvar o perfil.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="flex items-center gap-4">
                {avatar ? (
                  <img src={avatar} alt="Meu avatar" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <UserRound className="h-16 w-16 text-muted-foreground" />
                )}
                <label className="cursor-pointer text-sm text-primary">
                  <Camera className="inline h-4 w-4" /> Alterar avatar
                  <input
                    aria-label="Enviar avatar"
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2_097_152) {
                        toast.error("Use JPG, PNG ou WebP de até 2 MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result !== "string") return;
                        const image = new Image(); image.onload = () => { const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128; const ctx = canvas.getContext('2d'); if (!ctx) return; const side = Math.min(image.width,image.height); ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,128,128); setAvatar(canvas.toDataURL('image/webp',0.75)); }; image.src = reader.result;
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              <label className="block text-sm">
                Nome público
                <input
                  className={fieldClass}
                  required
                  minLength={2}
                  maxLength={50}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={leaderboard}
                  onChange={(event) => setLeaderboard(event.target.checked)}
                  className="accent-primary"
                />
                Participar do ranking de jogadores
              </label>
              <Button
                type="submit"
                disabled={busy}
                className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Salvar perfil
              </Button>
            </form>
          ) : null}
          <Button
            type="button"
            onClick={() => {
              void (async () => { await queryClient.cancelQueries(); queryClient.clear(); await signOut(); onOpenChange(false); })().catch(() => toast.error("Não foi possível sair."));
            }}
            className="mt-4 inline-flex items-center gap-2 text-sm hover:underline"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
