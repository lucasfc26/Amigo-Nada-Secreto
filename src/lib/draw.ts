import { canDraw, normalizeName } from "./names.ts";

export type Assignment = {
  giver: string;
  receiver: string;
};

export type Phase = "edit" | "drawing" | "result";

export type DrawState = {
  phase: Phase;
  pool: string[];
  order: string[];
};

export const emptyDraw: DrawState = {
  phase: "edit",
  pool: [],
  order: [],
};

export type DrawAction =
  | { type: "start"; names: readonly string[] }
  | { type: "pop" }
  | { type: "finish" }
  | { type: "reset" };

export function popRandom<T>(pool: readonly T[]): { picked: T; rest: T[] } {
  if (pool.length === 0) {
    throw new Error("Não há nomes para sortear.");
  }

  const index = Math.floor(Math.random() * pool.length);
  const picked = pool[index];
  if (picked === undefined) {
    throw new Error("Não há nomes para sortear.");
  }

  return {
    picked,
    rest: [...pool.slice(0, index), ...pool.slice(index + 1)],
  };
}

export function drainRandom<T>(pool: readonly T[]): T[] {
  const output: T[] = [];
  let rest = [...pool];

  while (rest.length > 0) {
    const next = popRandom(rest);
    output.push(next.picked);
    rest = next.rest;
  }

  return output;
}

// Cada posição aponta para a próxima. A última aponta para a primeira.
// O resultado é um ciclo só: sem autoatribuição, sem repetir e sem sobra.
export function linkCycle(order: readonly string[]): Assignment[] {
  if (order.length < 2) {
    throw new Error("O ciclo precisa de pelo menos duas pessoas.");
  }

  return order.map((giver, index) => {
    const receiver = order[(index + 1) % order.length];
    if (receiver === undefined) {
      throw new Error("A ordem sorteada está incompleta.");
    }
    return { giver, receiver };
  });
}

export function cycleHolds(
  names: readonly string[],
  order: readonly string[],
  assignments: readonly Assignment[],
): boolean {
  if (order.length < 2 || order.length !== names.length || assignments.length !== order.length) {
    return false;
  }

  const expected = new Set(names.map((name) => normalizeName(name)));
  if (expected.size !== names.length) return false;

  const ordered = order.map((name) => normalizeName(name));
  if (new Set(ordered).size !== ordered.length) return false;
  if (ordered.some((name) => !expected.has(name))) return false;

  return assignments.every((item, index) => {
    const receiver = order[(index + 1) % order.length];
    return item.giver === order[index] && item.receiver === receiver && item.giver !== item.receiver;
  });
}

export function formatAssignments(assignments: readonly Assignment[]): string {
  return assignments
    .map((item, index) => {
      const closing = index === assignments.length - 1 ? " (fecha o ciclo)" : "";
      return `${item.giver} → ${item.receiver}${closing}`;
    })
    .join("\n");
}

export function popDelay(total: number): number {
  if (total > 16) return 140;
  if (total > 8) return 240;
  return 420;
}

export function drawReducer(state: DrawState, action: DrawAction): DrawState {
  switch (action.type) {
    case "start": {
      if (!canDraw(action.names)) return state;
      return { phase: "drawing", pool: [...action.names], order: [] };
    }
    case "pop": {
      if (state.phase !== "drawing" || state.pool.length === 0) return state;
      const next = popRandom(state.pool);
      const order = [...state.order, next.picked];
      if (next.rest.length === 0) {
        return { phase: "result", pool: [], order };
      }
      return { phase: "drawing", pool: next.rest, order };
    }
    case "finish": {
      if (state.phase !== "drawing") return state;
      return {
        phase: "result",
        pool: [],
        order: [...state.order, ...drainRandom(state.pool)],
      };
    }
    case "reset":
      return emptyDraw;
    default: {
      const unreachable: never = action;
      return unreachable;
    }
  }
}
