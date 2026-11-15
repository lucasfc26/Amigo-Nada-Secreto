import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  accountError,
  displayNameError,
  loginEmail,
  maskLogin,
  roomNameError,
  safeRoomPath,
  translateError,
} from "./account.ts";

test("aceita login simples e rejeita senha diferente", () => {
  assert.equal(accountError({ login: "Ana", password: "segredo", confirm: "segredo" }), null);
  assert.equal(loginEmail(" Ana "), "ana@users.sorteador.app");
  assert.equal(maskLogin(" Ana Maria! "), "anamaria");
  assert.match(
    accountError({ login: "Ana", password: "segredo", confirm: "outra" }) ?? "",
    /não são iguais/,
  );
});

test("rejeita login curto e senha curta", () => {
  assert.match(accountError({ login: "a", password: "segredo" }) ?? "", /login/);
  assert.match(accountError({ login: "ana", password: "123" }) ?? "", /senha/);
});

test("o caminho de convite só aceita uma sala", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  assert.equal(safeRoomPath(`/sala/${id}`), `/sala/${id}`);
  assert.equal(safeRoomPath("https://exemplo.com"), null);
  assert.equal(safeRoomPath("/sala/nao-e-uuid"), null);
});

test("traduz os erros mais comuns", () => {
  assert.match(translateError("User already registered") ?? "", /já existe/);
  assert.match(translateError("Invalid login credentials") ?? "", /incorretos/);
  assert.equal(translateError("Senha incorreta."), "Senha incorreta.");
});

test("o nome da sala tem limite", () => {
  assert.equal(roomNameError("  Natal da firma  "), null);
  assert.ok(roomNameError("a"));
});

test("o nome de exibição tem limite", () => {
  assert.equal(displayNameError("  Ana Clara  "), null);
  assert.match(displayNameError(" A ") ?? "", /entre 2 e 40/);
  assert.match(displayNameError("   ") ?? "", /entre 2 e 40/);
});
