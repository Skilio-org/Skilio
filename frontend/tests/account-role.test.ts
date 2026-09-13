import { afterEach, beforeEach, expect, test } from "bun:test";
import { accountRole, setAccountRole, subscribeAccountRole } from "../src/lib/account-role";

const oldStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
let values: Map<string, string>;
beforeEach(() => {
  values = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  Object.defineProperty(globalThis, "window", { configurable: true, value: new EventTarget() });
});
afterEach(() => {
  if (oldStorage) Object.defineProperty(globalThis, "localStorage", oldStorage);
  else Reflect.deleteProperty(globalThis, "localStorage");
  if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

test("role is normalized per account and isolated from other accounts", () => {
  setAccountRole(" Alex@Example.com ", "freelancer");
  expect(accountRole("alex@example.com")).toBe("freelancer");
  expect(accountRole("other@example.com")).toBe("client");
  setAccountRole("alex@example.com", "client");
  expect(accountRole("alex@example.com")).toBe("client");
});
test("subscribers see the persisted value immediately and can unsubscribe", () => {
  const observed: string[] = [];
  const unsubscribe = subscribeAccountRole(() => observed.push(accountRole("alex@example.com")));
  setAccountRole("alex@example.com", "freelancer");
  unsubscribe();
  setAccountRole("alex@example.com", "client");
  expect(observed).toEqual(["freelancer"]);
});
test("storage failures do not announce a workspace switch", () => {
  let changes = 0;
  const unsubscribe = subscribeAccountRole(() => changes++);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    },
  });
  expect(accountRole("alex@example.com")).toBe("client");
  expect(() => setAccountRole("alex@example.com", "freelancer")).toThrow("blocked");
  expect(changes).toBe(0);
  unsubscribe();
});
