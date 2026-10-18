import test from "node:test";
import assert from "node:assert/strict";
import { emailAuth, passwordError } from "../src/auth-actions";

function fixture() {
  const calls: { name: string; args: unknown[] }[] = [];
  let result: any = { data: { session: null }, error: null };
  const api = Object.fromEntries(["signInWithPassword", "signUp", "resend", "resetPasswordForEmail", "updateUser"].map(name => [name, async (...args: unknown[]) => { calls.push({ name, args }); return result; }]));
  return { actions: emailAuth(api as any, () => "https://example.com/No-More-Scrolling/"), calls, respond: (value: unknown) => { result = value; } };
}
test("password login preserves the password exactly and trims only the email", async () => {
  const f = fixture(); await f.actions.signIn(" person@example.com ", " password with spaces ");
  assert.deepEqual(f.calls, [{ name: "signInWithPassword", args: [{ email: "person@example.com", password: " password with spaces " }] }]);
});
test("signup distinguishes confirmation-required from an authenticated session", async () => {
  const f = fixture(); assert.equal(await f.actions.signUp("person@example.com", "test-password"), false);
  assert.deepEqual(f.calls[0].args, [{ email: "person@example.com", password: "test-password", options: { emailRedirectTo: "https://example.com/No-More-Scrolling/" } }]);
  f.respond({ data: { session: { user: { id: "test-user" } } }, error: null });
  assert.equal(await f.actions.signUp("person@example.com", "test-password"), true);
});
test("confirmation resend and password recovery use the configured Pages base", async () => {
  const f = fixture(); await f.actions.resend(" person@example.com "); await f.actions.reset(" person@example.com ");
  assert.deepEqual(f.calls, [
    { name: "resend", args: [{ type: "signup", email: "person@example.com", options: { emailRedirectTo: "https://example.com/No-More-Scrolling/" } }] },
    { name: "resetPasswordForEmail", args: ["person@example.com", { redirectTo: "https://example.com/No-More-Scrolling/" }] },
  ]);
});
test("password change uses the authenticated Auth endpoint and propagates failure", async () => {
  const f = fixture(); const failure = { code: "weak_password" }; f.respond({ error: failure });
  await assert.rejects(f.actions.changePassword("short"), error => error === failure);
  assert.deepEqual(f.calls, [{ name: "updateUser", args: [{ password: "short" }] }]);
});
test("login error messages do not reveal whether an account exists", () => {
  assert.equal(passwordError("invalid_credentials", true), "Incorrect email or password.");
  assert.match(passwordError("email_not_confirmed", false), /确认链接/);
  assert.match(passwordError("over_email_send_rate_limit", true), /Too many requests/);
});
