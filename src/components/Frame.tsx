import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth.ts";

export function Frame({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 px-4 py-8 font-sans text-ink sm:px-6 sm:py-14">
      <header className="flex items-center justify-between gap-4 text-snow">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ribbon font-display text-lg tracking-wide text-[#fffdf9] ring-2 ring-tinsel"
            aria-hidden="true"
          >
            AS
          </span>
          <span className="font-display text-2xl leading-none sm:text-3xl">
            Amigo <em className="text-holly italic">secreto</em>
          </span>
        </Link>
        {auth.profile ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="max-w-32 truncate text-frost">
              {auth.profile.displayName || auth.profile.login}
            </span>
            <button
              type="button"
              className="cursor-pointer font-semibold text-tinsel"
              onClick={() => void auth.signOut()}
            >
              Sair
            </button>
          </div>
        ) : (
          <Link to="/entrar" className="text-sm font-semibold text-tinsel">
            Entrar
          </Link>
        )}
      </header>
      {children}
      <footer className="pb-4 text-sm text-frost">
        Quem entra na sala vê a lista. Depois do sorteio, cada pessoa vê só o próprio nome.
      </footer>
    </div>
  );
}
