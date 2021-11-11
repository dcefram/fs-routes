import {
  listFilesRecursive,
  sortItems,
  convertKeysToRoutePath,
} from "./fs-routes";

jest.mock("fs");
jest.mock("process", () => ({
  cwd: () => "/path",
}));
jest.mock("./require", () => {
  return {
    __esModule: true,
    default: jest.fn().mockReturnValue("some value"),
  };
});

describe("listFilesRecursive", () => {
  beforeEach(() => {
    require("fs").__setMockFiles({
      "/path/routes/index.js": "index contents",
      "/path/routes/sub": {
        "/path/routes/sub/index.js": "sub index contents",
        "/path/routes/sub/ping.js": "sub ping contents",
      },
      "/path/routes/[slug]": {
        "/path/routes/[slug]/index.js": "slug index contents",
        "/path/routes/[slug]/[id].js": "slug id contents",
      },
    });
  });

  it("should have its keys based on the file name and its file path relative to the path provided", () => {
    const map = listFilesRecursive("/routes", "/routes");
    const expected = [
      "/index.js",
      "/sub/index.js",
      "/sub/ping.js",
      "/[slug]/index.js",
      "/[slug]/[id].js",
    ];
    expect(Object.keys(map)).toMatchObject(expected);
  });
});

describe("sortItems", () => {
  it("should sort the routes based on priority, with index as the priority, then the other non-slugs, while slugs are put to the bottom of the stack", () => {
    const files = ["/ping.js", "/pong.js", "/[slug].js", "/index.js", "/hi.js"];
    const sorted = files.sort(sortItems);

    expect(sorted).toEqual([
      "/index.js",
      "/ping.js",
      "/pong.js",
      "/hi.js",
      "/[slug].js",
    ]);
  });
});

describe("convertKeysToRoutePath", () => {
  it("should remove the .js suffix", () => {
    const files = ["/index.js", "/sub/index.js", "/sub/ping.js"];
    const routes = files.map(convertKeysToRoutePath);

    expect(routes).toEqual([
      { key: "/index.js", path: "" },
      { key: "/sub/index.js", path: "/sub" },
      { key: "/sub/ping.js", path: "/sub/ping" },
    ]);
  });

  it("should remove the .ts suffix", () => {
    const files = ["/index.ts", "/sub/index.ts", "/sub/ping.ts"];
    const routes = files.map(convertKeysToRoutePath);

    expect(routes).toEqual([
      { key: "/index.ts", path: "" },
      { key: "/sub/index.ts", path: "/sub" },
      { key: "/sub/ping.ts", path: "/sub/ping" },
    ]);
  });

  it("should convert [slugs] to :slugs format", () => {
    const files = [
      "/index.ts",
      "/sub/index.ts",
      "/sub/ping.ts",
      "/sub/[id].ts",
      "/[userId]/index.ts",
      "/[userId]/[recordId].ts",
    ];
    const routes = files.map(convertKeysToRoutePath);

    expect(routes).toEqual([
      { key: "/index.ts", path: "" },
      { key: "/sub/index.ts", path: "/sub" },
      { key: "/sub/ping.ts", path: "/sub/ping" },
      { key: "/sub/[id].ts", path: "/sub/:id" },
      { key: "/[userId]/index.ts", path: "/:userId" },
      { key: "/[userId]/[recordId].ts", path: "/:userId/:recordId" },
    ]);
  });
});
