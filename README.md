# fs-routes

Inspired by Vercel's Nextjs approach to pages. Also inspired by the "original" [fs-router](https://github.com/jesseditson/fs-router) for [Micro](https://github.com/vercel/micro).

I initially made this for [Polka](https://github.com/lukeed/polka), but it also worked for my newer fastify-based projects when that became a thing.

## Features

- Structure route handlers like serverless functions/lambdas
- Zero dependencies
- Zero configuration
- Path segments

## Installation

```bash
npm i @dcefram/fs-routes
```

## Usage

In your entry file where you created your fastify, polka, or express app:

```javascript
import Fastify from "fastify";
import fsRoutes from "@dcefram/fs-routes";
const fastify = Fastify({ logger: true });

fsRoutes(fastify, "/routes").listen(process.env.PORT, (error) => {
  if (error) throw error;

  console.log(`API Server running at port ${process.env.PORT}`);
});
```

Folder structure of your app:

```bash
your-app
├── index.js # assuming that this is where you initialized your fastify app
└── routes
    └── user
        ├── [slug]
        │   ├── images.js
        │   └── comments.js
        └── [slug].js
```

Each routes file should have a `module.exports` that exports an object that contains the handlers. Here's an example:

```javascript
const httpErrors = require("http-errors");

module.exports = {
  get: (request, reply) => {
    const { slug } = req.params;
    reply.send({ slug });
  },
  put: (request, reply) => {
    reply.send(httpErrors.NotImplemented());
  },
  delete: (request, reply) => {
    reply.send(httpErrors.NotImplemented());
  },
};
```

It could also export the handlers using the ESM format:

```javascript
// OR export
export function get(request, reply) {
  const { slug } = req.params;
  reply.send({ slug });
}

export function put(request, reply) {
  reply.send(httpErrors.NotImplemented());
}

export function delete(request, reply) {
  reply.send(httpErrors.NotImplemented());
}
```

With the folder structure above, you'll get the following endpoints:

```bash
GET /user/:slug
PUT /user/:slug
DELETE /user/:slug
GET /user/:slug/images # assuming that images.js has only `get` exported
GET /user/:slug/comments # assuming that comments.js has only `get` exported
```

## Why make this?

I liked how easy it was to navigate through a Next.js-based project. But there are times that we simply want to ship a pure Node.js API without the frontend,
and this is one of the building blocks that I made to make sure that I stay happy building the project.
