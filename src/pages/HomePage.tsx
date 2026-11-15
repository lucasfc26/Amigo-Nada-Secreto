import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.ts";
import { ChristmasScene } from "../components/ChristmasScene.tsx";
import { roomNameError } from "../lib/account.ts";
import { createRoom, loadRooms, type RoomSummary } from "../lib/rooms.ts";
import { card, fieldClass, primaryButton } from "../ui.ts";

export function HomePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const mismatch = confirm.length > 0 && confirm !== password;

  useEffect(() => {
    if (!auth.profile) return;
    let active = true;
    void loadRooms(auth.profile.id).then((result) => {
      if (!active) return;
      setRooms(result.rooms);
      setListError(result.error);
    });
    return () => {
      active = false;
    };
  }, [auth.profile]);

  if (auth.loading) return <p className="text-frost">Carregando…</p>;
  if (!auth.profile) return <Navigate to="/entrar" replace />;

  async function submit() {
    const nameProblem = roomNameError(name);
    const passwordProblem =
      password.length < 6 || password.length > 72
        ? "A senha precisa ter entre 6 e 72 caracteres."
        : password !== confirm
          ? "As senhas não são iguais. Mude para continuar."
          : null;
    setFormError(nameProblem ?? passwordProblem);
    if (nameProblem || passwordProblem) return;

    setPending(true);
    const result = await createRoom(name, password);
    setPending(false);
    if ("error" in result) {
      setFormError(result.error);
      return;
    }
    navigate(`/sala/${result.id}`, { state: { roomPassword: password } });
  }

  return (
    <>
      <div className="overflow-hidden rounded-[28px] border border-tinsel/40 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
        <ChristmasScene />
      </div>
      <p className="max-w-2xl text-lg leading-relaxed text-frost">
        Crie uma sala com senha. Quem tiver conta vê todas as salas e entra pelo link ou pela lista. Quando você
        sortear, cada pessoa vê só o próprio amigo secreto.
      </p>
      <section className={card}>
        <span className="candy h-2 w-20 rounded-full" aria-hidden="true" />
        {!auth.configured && (
          <p className="rounded-2xl border border-gold bg-[#fff8ee] px-4 py-3 text-sm text-ink">
            Para salvar as salas, crie um projeto no Supabase, rode <span className="font-semibold">supabase/schema.sql</span>{" "}
            no SQL Editor, desative a confirmação de e-mail e preencha o arquivo <span className="font-semibold">.env</span>.
          </p>
        )}
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-3xl leading-none">Nova sala</h2>
            <p className="text-sm text-muted">A senha é pedida de quem abrir o convite.</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="room-name" className="text-sm font-semibold">
              Nome da sala
            </label>
            <input
              id="room-name"
              data-testid="room-name"
              value={name}
              maxLength={40}
              placeholder="Natal da família"
              onChange={(event) => setName(event.target.value)}
              className={fieldClass(false)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="room-password" className="text-sm font-semibold">
              Senha da sala
            </label>
            <input
              id="room-password"
              data-testid="room-password"
              type="password"
              value={password}
              maxLength={72}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass(false)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="room-password-confirm" className="text-sm font-semibold">
              Repetir senha
            </label>
            <input
              id="room-password-confirm"
              data-testid="room-password-confirm"
              type="password"
              value={confirm}
              maxLength={72}
              autoComplete="new-password"
              aria-invalid={mismatch}
              onChange={(event) => setConfirm(event.target.value)}
              className={fieldClass(mismatch)}
            />
          </div>
          {(mismatch || formError) && (
            <p role="alert" className="text-base font-semibold text-red-600">
              {mismatch ? "As senhas não são iguais. Mude para continuar." : formError}
            </p>
          )}
          <button type="submit" data-testid="create-room" className={`${primaryButton} w-full`} disabled={pending}>
            {pending ? "Criando…" : "Criar sala"}
          </button>
        </form>
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-3xl leading-none">Salas</h2>
          {listError && <p className="text-sm font-semibold text-red-600">{listError}</p>}
          {rooms.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-muted">
              Ainda não há salas.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rooms.map((room) => (
                <li key={room.id}>
                  <Link
                    to={`/sala/${room.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{room.name}</span>
                      <span className="text-sm text-muted">
                        {room.drawnAt ? "Sorteio feito" : "Aguardando sorteio"}
                        {room.ownerId === auth.profile?.id
                          ? " · Sua sala"
                          : room.joined
                            ? " · Você está nesta sala"
                            : " · Entrar com a senha"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
