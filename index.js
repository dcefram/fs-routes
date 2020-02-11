const fs = require('fs');

function listFilesRecursive(path, rootPath) {
  const items = fs.readdirSync(process.cwd() + path);
  let result = {};

  result = items.reduce((stack, item) => {
    const targetPath = `${path}/${item}`;
    const stat = fs.lstatSync(process.cwd() + targetPath);
    const key = targetPath.replace(rootPath, '');

    if (stat.isDirectory()) {
      return { ...stack, ...listFilesRecursive(targetPath, rootPath) };
    }

    return {
      ...stack,
      [key]: require(process.cwd() + targetPath)
    };
  }, {});

  return result;
}

module.exports = function(app, path) {
  const items = listFilesRecursive(path, path);

  // Yeah yeah, O(n^2)
  Object.keys(items).sort((left, right) => {
    const leftSeg = left.split('/')
    const rightSeg = right.split('/');

    if (leftSeg[leftSeg.length - 1][0] === ':') {
      return 1;
    } else if (rightSeg[rightSeg.length - 1][0] === ':') {
      return -1;
    }

    return 0;
  }).forEach(route => {
    const routeObject = items[route];
    Object.keys(routeObject).forEach(method => {
      let routeValue = routeObject[method];

      if (!Array.isArray(routeValue)) {
        routeValue = [routeValue];
      }

      app[method](route.replace(/.js$/, ''), ...routeValue);
    });
  });

  return app;
};
