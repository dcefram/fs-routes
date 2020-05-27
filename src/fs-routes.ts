import fs from "fs";

function listFilesRecursive(path: string, rootPath: string) {
  try {
    const items = fs.readdirSync(process.cwd() + path);
    let result = {};

    result = items.reduce((stack: any, item: string) => {
      const targetPath = `${path}/${item}`;
      const stat = fs.lstatSync(process.cwd() + targetPath);
      const key = targetPath.replace(rootPath, "");

      if (stat.isDirectory()) {
        return { ...stack, ...listFilesRecursive(targetPath, rootPath) };
      }

      return {
        ...stack,
        [key]: require(process.cwd() + targetPath),
      };
    }, {});

    return result;
  } catch (error) {
    console.error(error);
  }

  return {};
}

export default function (app: any, path: string) {
  const items = listFilesRecursive(path, path);

  Object.keys(items)
    .sort((left: string, right: string) => {
      const leftSeg = left.split("/");
      const rightSeg = right.split("/");
      const leftFilename = leftSeg[leftSeg.length - 1];
      const rightFilename = rightSeg[rightSeg.length - 1];

      if (leftFilename === "index.js" || leftFilename === "index.ts") {
        return -1;
      } else if (rightFilename === "index.js" || rightFilename === "index.ts") {
        return 1;
      }

      if (leftSeg[leftSeg.length - 1][0] === ":") {
        return 1;
      } else if (rightSeg[rightSeg.length - 1][0] === ":") {
        return -1;
      }

      return 0;
    })
    .forEach((route: string) => {
      const routeObject = items[route];
      Object.keys(routeObject).forEach((method: string) => {
        let routeValue = routeObject[method];

        if (!Array.isArray(routeValue)) {
          routeValue = [routeValue];
        }

        let routePath = route.replace(/.(js|ts)$/, "");
        routePath = routePath.replace(/\/index$/, "");

        app[method](routePath || "/", ...routeValue);
      });
    });

  return app;
}
