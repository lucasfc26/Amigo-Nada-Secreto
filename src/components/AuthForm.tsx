import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.ts";
import { safeRoomPath } from "../lib/account.ts";
import { fieldClass, primaryButton } from "../ui.ts";

type AuthFormProps = {
  mode: "login" | "signup";
  next?: string | null;
};

export function AuthForm({ mode, next }: AuthFormProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const mismatch = mode === "signup" && confirm.length > 0 && confirm !== password;
  const destination = safeRoomPath(next ?? null) ?? "/";

  async function submit() {
    setPending(true);
    const result =
      mode === "login" ? await auth.signIn(login, password) : await auth.signUp(login, password, confirm);
    setPending(false);
    if (result) {
      setError(result);
      return;
    }
    navigate(destination, { replace: true });
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="login" className="text-sm font-semibold">
          Login
        </label>
        <input
          id="login"
          data-testid="auth-login"
          value={login}
          maxLength={24}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="seu nome"
          onChange={(event) => setLogin(event.target.value)}
          className={fieldClass(false)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-semibold">
          Senha
        </label>
        <input
          id="password"
          data-testid="auth-password"
          type="password"
          value={password}
          maxLength={72}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="mínimo de 6 caracteres"
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass(false)}
        />
      </div>
      {mode === "signup" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="confirm-password" className="text-sm font-semibold">
            Repetir senha
          </label>
          <input
            id="confirm-password"
            data-testid="auth-confirm"
            type="password"
            value={confirm}
            maxLength={72}
            autoComplete="new-password"
            aria-invalid={mismatch}
            onChange={(event) => setConfirm(event.target.value)}
            className={fieldClass(mismatch)}
          />
        </div>
      )}
      {(mismatch || error) && (
        <p role="alert" data-testid="auth-error" className="text-base font-semibold text-red-600">
          {mismatch ? "As senhas não são iguais. Mude para continuar." : error}
        </p>
      )}
      <button type="submit" data-testid="auth-submit" className={`${primaryButton} w-full`} disabled={pending}>
        {pending ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
      </button>
      {mode === "login" ? (
        <p className="text-sm text-muted">
          Ainda não tem conta?{" "}
          <Link className="font-semibold text-ribbon" to={next ? `/cadastrar?next=${encodeURIComponent(next)}` : "/cadastrar"}>
            Cadastre-se
          </Link>
        </p>
      ) : (
        <p className="text-sm text-muted">
          Já tem conta?{" "}
          <Link className="font-semibold text-ribbon" to={next ? `/entrar?next=${encodeURIComponent(next)}` : "/entrar"}>
            Entrar
          </Link>
        </p>
      )}
    </form>
  );
}
