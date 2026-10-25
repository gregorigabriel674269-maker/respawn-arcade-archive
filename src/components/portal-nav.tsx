import { Link } from "@tanstack/react-router";
import { Gamepad2, MessageSquare, Trophy } from "lucide-react";
import { AccountButton } from "@/components/player-session";
import { catalogSearch } from "@/lib/catalog-search";

export function PortalNav({ current }: { current: "rankings" | "pedidos" }) {
  const item = (active: boolean) =>
    `inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`;
  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-auto flex h-11 items-center gap-2 font-display text-xl font-bold">
          <Gamepad2 className="text-primary" aria-hidden="true" /> RESPAWN
        </Link>
        <Link to="/jogos" search={catalogSearch()} className={item(false)}>
          Jogos
        </Link>
        <Link to="/rankings" className={item(current === "rankings")} aria-current={current === "rankings" ? "page" : undefined}>
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Rankings
        </Link>
        <Link to="/pedidos" className={item(current === "pedidos")} aria-current={current === "pedidos" ? "page" : undefined}>
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Pedidos
        </Link>
        <Link to="/desafio" className={item(false)}>Desafio</Link>
        <Link to="/controle" search={{room:''}} className={item(false)}>Controle</Link>
        <Link to="/saves" className={item(false)}>Saves</Link>
        <Link to="/admin" className={item(false)}>ADMIN</Link><Link to="/conta" className={item(false)}>Atividade</Link><AccountButton />
      </nav>
    </header>
  );
}
