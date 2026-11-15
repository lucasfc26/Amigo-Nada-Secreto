const LOGIN_PATTERN = /^[a-z0-9_]{3,24}$/;
const ROOM_PATH = /^\/sala\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeLogin(value: string): string {
  return value.trim().toLowerCase();
}

export function loginEmail(login: string): string {
  return `${normalizeLogin(login)}@users.sorteador.app`;
}

export function accountError(input: {
  login: string;
  password: string;
  confirm?: string;
}): string | null {
  const login = normalizeLogin(input.login);
  if (!LOGIN_PATTERN.test(login)) {
    return "O login precisa ter de 3 a 24 letras, números ou _.";
  }
  if (input.password.length < 6 || input.password.length > 72) {
    return "A senha precisa ter entre 6 e 72 caracteres.";
  }
  if (input.confirm !== undefined && input.password !== input.confirm) {
    return "As senhas não são iguais. Mude para continuar.";
  }
  return null;
}

export function roomNameError(name: string): string | null {
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 40) {
    return "O nome da sala precisa ter entre 2 e 40 caracteres.";
  }
  return null;
}

export function safeRoomPath(value: string | null): string | null {
  if (!value || !ROOM_PATH.test(value)) return null;
  return value;
}

export function translateError(message: string): string {
  const text = message.toLowerCase();
  if (
    text.includes("already registered") ||
    text.includes("already been registered") ||
    text.includes("user already exists") ||
    text.includes("duplicate key")
  ) {
    return "Esse login já existe. Escolha outro.";
  }
  if (text.includes("invalid login credentials") || text.includes("invalid credentials")) {
    return "Login ou senha incorretos.";
  }
  if (text.includes("password")) {
    return "A senha precisa ter entre 6 e 72 caracteres.";
  }
  if (text.includes("failed to fetch") || text.includes("network")) {
    return "Não consegui falar com o Supabase. Confira a internet e o arquivo .env.";
  }
  if (text.includes("does not exist") || text.includes("schema cache") || text.includes("permission denied")) {
    return "O banco ainda não está pronto. Rode o arquivo supabase/schema.sql no SQL Editor.";
  }
  return message;
}
