import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth.ts";
import { AuthForm } from "../components/AuthForm.tsx";
import { safeRoomPath } from "../lib/account.ts";
import { card } from "../ui.ts";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const auth = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next");

  if (auth.loading) return <p className="text-frost">Carregando…</p>;
  if (auth.profile) return <Navigate to={safeRoomPath(next) ?? "/"} replace />;

  return (
    <section className={card}>
      <span className="candy h-2 w-20 rounded-full" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-4xl leading-none">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
        <p className="text-sm text-muted">
          Só o login e a senha. O nome que aparece na sala você escolhe lá dentro.
        </p>
      </div>
      {!auth.configured && (
        <p className="rounded-2xl border border-gold bg-[#fff8ee] px-4 py-3 text-sm text-ink">
          Falta ligar o Supabase. Copie <span className="font-semibold">.env.example</span> para{" "}
          <span className="font-semibold">.env</span>, rode <span className="font-semibold">supabase/schema.sql</span> e
          desative a confirmação de e-mail.
        </p>
      )}
      <AuthForm mode={mode} next={next} />
    </section>
  );
}
