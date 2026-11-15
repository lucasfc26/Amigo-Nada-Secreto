import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth.ts";
import { AuthForm } from "../components/AuthForm.tsx";
import {
  deleteRoom,
  drawRoom,
  joinRoom,
  loadRoomView,
  removeMember,
  type RoomView,
} from "../lib/rooms.ts";
import { supabase } from "../lib/supabase.ts";
import { card, fieldClass, primaryButton, secondaryButton } from "../ui.ts";

const roomPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function RoomPage() {
  const { roomId = "" } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const createdPassword =
    (location.state as { roomPassword?: string } | null)?.roomPassword ?? "";
  const [notice] = useState(createdPassword);
  const [view, setView] = useState<RoomView>({ status: "missing" });
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const validId = roomPattern.test(roomId);
  const inviteUrl = `${window.location.origin}/sala/${roomId}`;

  const reload = useCallback(async () => {
    if (!validId) return;
    const next = await loadRoomView(roomId, auth.profile?.id ?? null);
    setView(next);
    setLoading(false);
  }, [auth.profile?.id, roomId, validId]);

  useEffect(() => {
    if (auth.loading) return;
    void reload();
    const client = supabase;
    if (!client || !validId) return;

    const timer = window.setInterval(() => void reload(), 5000);
    const channel = client
      .channel(`room-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sort_room_members", filter: `room_id=eq.${roomId}` }, () => {
        void reload();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sort_rooms", filter: `id=eq.${roomId}` }, () => {
        void reload();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sort_assignments", filter: `room_id=eq.${roomId}` }, () => {
        void reload();
      })
      .subscribe();

    return () => {
      window.clearInterval(timer);
      void client.removeChannel(channel);
    };
  }, [auth.loading, reload, roomId, validId]);

  async function enterRoom() {
    if (password.length < 6 || password.length > 72) {
      setError("A senha precisa ter entre 6 e 72 caracteres.");
      return;
    }
    setPending("join");
    const result = await joinRoom(roomId, password);
    setPending(null);
    if (result) {
      setError(result);
      return;
    }
    setPassword("");
    setError(null);
    await reload();
  }

  async function sortear() {
    setPending("draw");
    const result = await drawRoom(roomId);
    setPending(null);
    if (result) {
      setError(result);
      return;
    }
    setError(null);
    await reload();
  }

  async function excluirSala() {
    if (!window.confirm("Excluir esta sala e o sorteio?")) return;
    setPending("delete");
    const result = await deleteRoom(roomId);
    setPending(null);
    if (result) {
      setError(result);
      return;
    }
    navigate("/", { replace: true });
  }

  async function excluirPessoa(userId: string, login: string) {
    if (!window.confirm(`Remover ${login} da sala?`)) return;
    setPending(userId);
    const result = await removeMember(roomId, userId);
    setPending(null);
    if (result) {
      setError(result);
      return;
    }
    setError(null);
    await reload();
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Não foi possível copiar. Selecione o link abaixo.");
    }
  }

  const waiting = validId && (auth.loading || loading);

  if (waiting) return <p className="text-frost">Carregando a sala…</p>;

  if (!auth.configured) {
    return (
      <section className={card}>
        <h1 className="font-display text-4xl leading-none">Convite</h1>
        <p className="rounded-2xl border border-gold bg-[#fff8ee] px-4 py-3 text-sm text-ink">
          Falta ligar o Supabase. Copie .env.example para .env e rode supabase/schema.sql.
        </p>
        <AuthForm mode="login" next={`/sala/${roomId}`} />
      </section>
    );
  }

  if (view.status === "missing") {
    return (
      <section className={card}>
        <h1 className="font-display text-4xl leading-none">Sala não encontrada</h1>
        <Link to="/" className="font-semibold text-ribbon">
          Voltar
        </Link>
      </section>
    );
  }

  if (view.status === "error") {
    return (
      <section className={card}>
        <p role="alert" className="text-base font-semibold text-red-600">
          {view.message}
        </p>
        <Link to="/" className="font-semibold text-ribbon">
          Voltar
        </Link>
      </section>
    );
  }

  if (!auth.profile || view.status === "guest") {
    const roomName = view.status === "guest" ? view.name : "esta sala";
    return (
      <section className={card}>
        <span className="candy h-2 w-20 rounded-full" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold tracking-[0.16em] text-gold uppercase">Convite</p>
          <h1 className="font-display text-4xl leading-none">{roomName}</h1>
          <p className="text-sm text-muted">
            {auth.profile
              ? "Informe a senha da sala para entrar no sorteio."
              : "Entre na sua conta e depois informe a senha da sala."}
          </p>
        </div>
        {view.status === "guest" && view.drawn ? (
          <p className="text-sm font-semibold text-red-600">O sorteio desta sala já foi feito.</p>
        ) : auth.profile ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void enterRoom();
            }}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="join-password" className="text-sm font-semibold">
                Senha da sala
              </label>
              <input
                id="join-password"
                data-testid="join-password"
                type="password"
                value={password}
                maxLength={72}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClass(Boolean(error))}
              />
            </div>
            {error && (
              <p role="alert" className="text-base font-semibold text-red-600">
                {error}
              </p>
            )}
            <button type="submit" className={`${primaryButton} w-full`} disabled={pending === "join"}>
              {pending === "join" ? "Entrando…" : "Entrar na sala"}
            </button>
          </form>
        ) : (
          <AuthForm mode="login" next={`/sala/${roomId}`} />
        )}
      </section>
    );
  }

  const owner = view.room.ownerId === auth.profile.id;
  const drawn = view.room.drawnAt !== null;
  const ordered = [...view.members].sort((left, right) => {
    if (left.userId === view.room.ownerId) return -1;
    if (right.userId === view.room.ownerId) return 1;
    return left.joinedAt.localeCompare(right.joinedAt);
  });

  return (
    <section className={card}>
      <span className="candy h-2 w-20 rounded-full" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold tracking-[0.16em] text-gold uppercase">
          {owner ? "Sua sala" : "Sala"}
        </p>
        <h1 className="font-display text-4xl leading-none">{view.room.name}</h1>
        <p className="text-sm text-muted">
          {ordered.length === 1 ? "1 pessoa" : `${ordered.length} pessoas`}
          {drawn ? " · sorteio feito" : " · aguardando o dono sortear"}
        </p>
      </div>

      {notice && (
        <p className="rounded-2xl border border-gold bg-[#fff8ee] px-4 py-3 text-sm text-ink">
          Guarde a senha da sala: <span className="font-semibold">{notice}</span>. Ela não fica salva em texto.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="invite-link" className="text-sm font-semibold">
          Link do convite
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="invite-link"
            data-testid="invite-link"
            readOnly
            value={inviteUrl}
            onFocus={(event) => event.currentTarget.select()}
            className={fieldClass(false)}
          />
          <button type="button" data-testid="copy-invite" className={`${secondaryButton} shrink-0`} onClick={() => void copiarLink()}>
            {copied ? "Link copiado" : "Copiar link"}
          </button>
        </div>
      </div>

      {drawn && view.match && (
        <p data-testid="my-draw" className="text-base font-semibold text-moss">
          Você tirou {view.match.login}. Só você vê essa borda.
        </p>
      )}
      {drawn && !view.match && (
        <p className="text-sm text-muted">O sorteio já foi feito. Seu resultado aparece em instantes.</p>
      )}
      {!drawn && (
        <p className="text-sm text-muted">
          Depois do sorteio, o seu amigo secreto fica com a borda colorida. O resultado dos outros continua escondido.
        </p>
      )}

      <ul className="flex flex-col gap-2" aria-label="Quem está na sala">
        {ordered.map((member) => {
          const yours = view.match?.userId === member.userId;
          return (
            <li
              key={member.userId}
              data-testid="member"
              data-login={member.login}
              data-yours={yours ? "true" : "false"}
              className={
                yours
                  ? "flex items-center gap-3 rounded-2xl border-4 border-ribbon bg-[#fff1ee] px-3 py-3 ring-4 ring-tinsel"
                  : "flex items-center gap-3 rounded-2xl border border-line bg-paper px-3 py-2"
              }
            >
              <span className="min-w-0 flex-1 break-words font-semibold">{member.login}</span>
              {member.userId === view.room.ownerId && (
                <span className="shrink-0 text-sm font-medium text-gold">Dono</span>
              )}
              {yours && (
                <span className="shrink-0 rounded-full bg-ribbon px-2.5 py-0.5 text-xs font-semibold text-[#fffdf9]">
                  Seu sorteado
                </span>
              )}
              {owner && !drawn && member.userId !== auth.profile?.id && (
                <button
                  type="button"
                  className="shrink-0 cursor-pointer rounded-full px-2 py-1 text-sm font-medium text-muted hover:text-ribbon disabled:opacity-40"
                  disabled={pending === member.userId}
                  onClick={() => void excluirPessoa(member.userId, member.login)}
                >
                  Remover
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {error && (
        <p role="alert" className="text-base font-semibold text-red-600">
          {error}
        </p>
      )}

      {owner && (
        <div className="flex flex-col gap-3">
          {!drawn && (
            <>
              <button
                type="button"
                data-testid="draw-room"
                className={`${primaryButton} w-full`}
                disabled={pending === "draw" || ordered.length < 2}
                onClick={() => void sortear()}
              >
                {pending === "draw" ? "Sorteando…" : "Sortear"}
              </button>
              {ordered.length < 2 && (
                <p className="text-sm text-muted">É preciso de pelo menos duas pessoas na sala.</p>
              )}
            </>
          )}
          <button
            type="button"
            data-testid="delete-room"
            className={`${secondaryButton} w-full`}
            disabled={pending === "delete"}
            onClick={() => void excluirSala()}
          >
            {pending === "delete" ? "Excluindo…" : "Excluir sala"}
          </button>
        </div>
      )}
    </section>
  );
}
