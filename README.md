# fs-routes

Inspired by ZEIT Now's Serverless Functions structure. Also inspired by the "original" [fs-router](https://github.com/jesseditson/fs-router) for [Micro](https://github.com/zeit/micro).

I made this *helper* for a NodeJS project that uses [Polka](https://github.com/lukeed/polka). I assume that this would also work for Express as they share very similar route patterns.

## Features

- Structure route handlers like Serverless Functions
- Zero dependencies
- Zero configuration
- Path segments
- < 50 LOC

## Installation

```bash
npm i @dcefram/fs-routes
```

## Usage

In your entry file where you created your polka/express app:
```javascript
const polka = require('polka');
const createRoutes = require('@dcefram/fs-routes');
const app = polka();

createRoutes(app, '/routes')
  .listen(process.env.PORT, error => {
    if (error) throw error;

    console.log(`API Server running at port ${process.env.PORT}`);
  })
```

Folder structure of your app:
```bash
your-app
├── index.js # assuming that this is where you created your polka app
└── routes
    └── user
        ├── :slug
        │   ├── images.js
        │   └── comments.js
        └── :slug.js
```

Each routes file should have a `module.exports` that exports an object that contains the handlers. Here's an example:

```javascript
// :slug.js
const send = require('@polka/send-type');

module.exports = {
  get: (req, res) => {
    const { slug } = req.params;

    send(res, 200, {
      slug,
    });
  },
  put: (req, res) => {
    send(res, 501);
  },
  delete: (req, res) => {
    send(res, 501);
  }
};

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

After maintaining (ie. adding endpoints/features) a Polka-based project, I missed how easy it was to work on Now.sh' serverless functions. Just add an `api` folder in your project and add Micro-like files in it.

I disliked the ceremony of adding new routes in the project that I worked on that followed the MVC pattern, and decided to *refactor* it. I wanted to use ZEIT's Micro framework after I found out that someone made [fs-router](https://github.com/jesseditson/fs-router) for it, but decided not to due to many custom middlewares that the team made, that I would need to port over.
