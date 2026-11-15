import { strict as assert } from "node:assert";
import { test } from "node:test";
import { cycleHolds, drawReducer, emptyDraw, linkCycle } from "./draw.ts";

const group = ["Ana", "Bruno", "Carla", "Diego", "Eva", "Fábio"];

function finishByPops(names: readonly string[]) {
  let state = drawReducer(emptyDraw, { type: "start", names });
  assert.equal(state.phase, "drawing");

  while (state.phase === "drawing") {
    state = drawReducer(state, { type: "pop" });
  }

  return state;
}

test("não começa com menos de duas pessoas nem com nome repetido", () => {
  assert.deepEqual(drawReducer(emptyDraw, { type: "start", names: ["Ana"] }), emptyDraw);
  assert.equal(drawReducer(emptyDraw, { type: "start", names: ["Ana", " ana "] }).phase, "edit");
});

test("cem sorteios fecham um ciclo sem repetir e sem sobrar", () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const state = finishByPops(group);
    assert.equal(state.phase, "result");
    assert.deepEqual(state.pool, []);
    assert.equal(new Set(state.order).size, group.length);

    const assignments = linkCycle(state.order);
    assert.equal(cycleHolds(group, state.order, assignments), true);
    assert.equal(assignments[0]?.giver, state.order[0]);
    assert.equal(assignments[assignments.length - 1]?.receiver, state.order[0]);
    assert.equal(
      assignments.every((item) => item.giver !== item.receiver),
      true,
    );
  }
});

test("pular a animação não repete nem deixa nome de fora", () => {
  let state = drawReducer(emptyDraw, { type: "start", names: group });
  state = drawReducer(state, { type: "pop" });
  const already = state.order[0];
  assert.ok(already);

  state = drawReducer(state, { type: "finish" });
  assert.equal(state.phase, "result");
  assert.deepEqual(state.pool, []);
  assert.equal(state.order.filter((name) => name === already).length, 1);
  assert.equal(new Set(state.order).size, group.length);
  assert.equal(cycleHolds(group, state.order, linkCycle(state.order)), true);
});

test("duas pessoas trocam entre si", () => {
  const state = finishByPops(["Ana", "Bruno"]);
  const assignments = linkCycle(state.order);
  const first = state.order[0];
  const second = state.order[1];

  assert.deepEqual(
    assignments.map((item) => [item.giver, item.receiver]),
    [
      [first, second],
      [second, first],
    ],
  );
});

test("um nome só não forma ciclo", () => {
  assert.throws(() => linkCycle(["Ana"]), /duas pessoas/);
});

test("o pop não altera a lista original", () => {
  const names = ["Ana", "Bruno", "Carla"];
  const copy = [...names];
  finishByPops(names);
  assert.deepEqual(names, copy);
});
