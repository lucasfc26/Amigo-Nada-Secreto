import { strict as assert } from "node:assert";
import { test } from "node:test";
import { canDraw, cleanName, findDuplicate } from "./names.ts";

test("limpa espaços e preserva o jeito de escrever", () => {
  assert.equal(cleanName("  Ana   Clara  "), "Ana Clara");
});

test("nome repetido ignora maiúsculas e espaços", () => {
  assert.equal(findDuplicate("  ana ", ["Ana", "Bruno"]), "Ana");
  assert.equal(findDuplicate("JOÃO", ["João"]), "João");
  assert.equal(findDuplicate("Carla", ["Ana"]), null);
  assert.equal(findDuplicate("   ", ["Ana"]), null);
});

test("só sorteia com dois nomes diferentes", () => {
  assert.equal(canDraw(["Ana"]), false);
  assert.equal(canDraw(["Ana", "ana"]), false);
  assert.equal(canDraw(["Ana", "  "]), false);
  assert.equal(canDraw(["Ana", "Bruno"]), true);
});
