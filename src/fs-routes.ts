import fs from "fs";
import path from "path";
import process from "process";
import inlineRequire from "./require";

interface Options {
  ignorePattern?: string;
}

interface FilesMap {
  [route: string]: NodeRequire;
}

interface KeyPath {
  key: string;
  path: string;
}

const slugPattern = "\\[([\\w\\-\\_\\~]+)\\]";

export function listFilesRecursive(
  path: string,
  rootPath: string,
  ignorePattern: string = "^_"
): FilesMap {
  try {
    const items = fs.readdirSync(process.cwd() + path);
    let result = {};

    result = items.reduce((stack: any, item: string) => {
      const targetPath = `${path}/${item}`;
      const stat = fs.lstatSync(process.cwd() + targetPath);
      const key = targetPath.replace(rootPath, "");

      if (new RegExp(ignorePattern).test(key)) {
        return stack;
      }

      if (stat.isDirectory()) {
        return { ...stack, ...listFilesRecursive(targetPath, rootPath) };
      }

      return {
        ...stack,
        [key]: inlineRequire(process.cwd() + targetPath),
      };
    }, {} as FilesMap);

    return result;
  } catch (error) {
    console.error(error);
  }

  return {};
}

export function sortItems(left: string, right: string) {
  const leftFilename = path.basename(left);
  const rightFilename = path.basename(right);

  if (leftFilename === "index.js" || leftFilename === "index.ts") {
    return -1;
  } else if (rightFilename === "index.js" || rightFilename === "index.ts") {
    return 1;
  }

  const slugRegex = new RegExp(`${slugPattern}\.js$`, "i");
  if (slugRegex.test(leftFilename)) {
    return 1;
  } else if (slugRegex.test(rightFilename)) {
    return -1;
  }

  return 0;
}

export function convertKeysToRoutePath(key: string): KeyPath {
  let routePath = key.replace(/.(js|ts)$/, "");
  routePath = routePath.replace(/\/index$/, "");
  routePath = routePath.replace(
    new RegExp(`${slugPattern}\.js$`, "i"),
    (_, slug) => `:${slug}.js`
  );
  routePath = routePath.replace(
    new RegExp(slugPattern, "ig"),
    (_, slug) => `:${slug}`
  );
  return { key, path: routePath };
}

export default function fsRoutes(app: any, rootPath: string, options: Options) {
  const items = listFilesRecursive(rootPath, rootPath, options.ignorePattern);

  Object.keys(items)
    .sort(sortItems)
    .map(convertKeysToRoutePath)
    .forEach((keyPath) => {
      const routeObject = items[keyPath.key];
      Object.keys(routeObject).forEach((method: string) => {
        let routeValue = routeObject[method];

        if (!Array.isArray(routeValue)) {
          routeValue = [routeValue];
        }

        app[method](keyPath.path || "/", ...routeValue);
      });
    });

  return app;
}
