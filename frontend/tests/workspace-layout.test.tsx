import { beforeEach, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

let path = "/dashboard";
let loggedIn = true;
let role = "client";
let account: Record<string, unknown>;

mock.module("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
  redirect: (options: unknown) => options,
  useRouterState: () => path,
  Navigate: ({ to }: { to: string }) => createElement("span", null, `redirect:${to}`),
  Outlet: () => createElement("span", null, "workspace-content"),
}));
mock.module("@/hooks/useAuth", () => ({
  default: () => account,
  isLoggedIn: () => loggedIn,
}));
mock.module("@/hooks/useAccountRole", () => ({ accountRole: () => role }));
for (const name of ["Footer", "Logo"]) mock.module(`@/components/Common/${name}`, () => ({ [name]: () => null }));
mock.module("@/components/Navigation/TopNav", () => ({ TopNav: () => null }));
mock.module("@/components/ui/button", () => ({
  Button: ({ children, disabled }: { children: string; disabled?: boolean }) =>
    createElement("button", { type: "button", disabled }, children),
}));

const { Route } = await import("../src/routes/_layout");
const route = Route as unknown as {
  component: () => ReturnType<typeof createElement>;
  beforeLoad: () => void;
};
const render = () => renderToStaticMarkup(createElement(route.component));

beforeEach(() => {
  path = "/dashboard";
  loggedIn = true;
  role = "client";
  account = {
    user: { email: "test@example.com" },
    refetch: mock(),
    logout: mock(),
  };
});

test("signed-out visits redirect to login", () => {
  loggedIn = false;
  expect(() => route.beforeLoad()).toThrow();
  try {
    route.beforeLoad();
  } catch (error) {
    expect(error).toEqual({ to: "/login" });
  }
});

test("route entry does not fetch an account or throw on a query failure", () => {
  account = { error: new Error("Network unavailable") };
  expect(() => route.beforeLoad()).not.toThrow();
});

test("loading account does not mount workspace content", () => {
  account = { isPending: true };
  expect(render()).toContain("Loading your workspace");
  expect(render()).not.toContain("workspace-content");
});

test("failed account load offers retry and sign in", () => {
  account = { error: new Error("Network unavailable") };
  expect(render()).toContain('role="alert"');
  expect(render()).toContain("Try again");
  expect(render()).toContain("Back to sign in");
  expect(render()).not.toContain("workspace-content");
});

test("retry is disabled while fetching", () => {
  account = { error: new Error("Network unavailable"), isFetching: true };
  expect(render()).toContain("Trying again");
  expect(render()).toContain('disabled=""');
});

test("client dashboard renders after account resolution", () => {
  expect(render()).toContain("workspace-content");
});

test("freelancers are routed to their own dashboard and messages", () => {
  role = "freelancer";
  expect(render()).toContain("redirect:/freelancer-dashboard");
  path = "/messages";
  expect(render()).toContain("redirect:/freelancer-messages");
  path = "/settings";
  expect(render()).toContain("redirect:/freelancer-settings");
  path = "/freelancer-dashboard";
  expect(render()).toContain("workspace-content");
});

test("clients cannot enter the freelancer workspace", () => {
  path = "/freelancer-dashboard";
  expect(render()).toContain("redirect:/dashboard");
});
