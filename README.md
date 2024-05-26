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
import { Quark } from '@bit-js/quark';

const app = new Quark()
    .get('/', (ctx) => ctx.body('Hello world'));

export default app;
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