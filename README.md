# Quark

Yet another Cloudflare framework.

## Getting Started

### Cloudflare

Install `@bit-js/quark` with `@cloudflare/workers-types`.

```ts
npm i @bit-js/quark
npm i @cloudflare/workers-types --dev
```

An example `Hello world` app:

```ts
import { Quark } from "@bit-js/quark";

const app = new Quark()
  .use((ctx) => {
    // TODO: Cache the header if it is static
    ctx.headers.push(["Content-Type", "text/plain"]);
    return ctx.next();
  })
  .get("/", (ctx) => ctx.body("Hello world"));

export default app;
```

To access `ExecutionContext` and `Env`:

```ts
(ctx) => {
  // Environment variables
  ctx.env;

  // Execution context
  ctx.execution;
};
```

To overwrite `Env` types:

```ts
declare global {
  interface Env {
    MY_ENV_VAR: string;
    MY_SECRET: string;
    myKVNamespace: KVNamespace;
  }
}
```

To use `Quark` with service workers:

```ts
addEventListener("fetch", app.handleEvent);
```

### Deno

An example `Hello world` app:

```ts
import { Quark } from "npm:@bit-js/quark";

const app = new Quark()
  .use((ctx) => {
    // TODO: Cache the header if it is static
    ctx.headers.push(["Content-Type", "text/plain"]);
    return ctx.next();
  })
  .get("/", (ctx) => ctx.body("Hello world"));

export default app;
```

### Others

Install `@bit-js/quark`:

```ts
npm i @bit-js/quark
```

An example `Hello world` app:

```ts
import { Quark } from "@bit-js/quark";

const app = new Quark()
  .use((ctx) => {
    ctx.headers["Content-Type"] = "text/plain";
    return ctx.next();
  })
  .get("/", (ctx) => ctx.body("Hello world"));

export default app;
```

### Client

Export your app type:

```ts
export type TApp = typeof app;
```

Usage on client:

```ts
import type { TApp } from "../server";
import { client } from "@bit-js/quark";

const app = client<TApp>("http://localhost:3000");

const res = await app.get("/");
await res.text(); // Hello world
```
