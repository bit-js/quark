import { AsyncFunction } from '../utils/defaultOptions';
import type { RequestMethod } from '../utils/methods';
import type { AwaitedReturn } from '../utils/types';
import { Context, type BaseHandler, type Handler } from './types/handler';
import Router from './utils/router';
import { isCloudflare } from './utils/runtime';

export type Route = [method: string, path: string, handlers: BaseHandler[]];
export type RoutesRecord = Route[];

interface Register<Method extends string, Routes extends RoutesRecord, State> {
    <
        Path extends string,
        Handlers extends Handler<Path, State>[]
    >(path: Path, ...handlers: Handlers): Quark<[...Routes, [Method, Path, Handlers]]>
}
type HandlerRegisters<T extends RoutesRecord, State> = {
    [Method in RequestMethod | 'any']: Register<Method, T, State>;
}

export class Quark<Routes extends RoutesRecord = [], State = {}> {
    readonly middlewares: BaseHandler<State>[];
    readonly routes: Routes;

    /**
     * Create a Quasar instance
     */
    constructor() {
        this.middlewares = [];
        this.routes = [] as any;
    }

    /**
     * Register a middleware
     */
    use(f: BaseHandler<State>) {
        this.middlewares.push(f);
        return this;
    }

    /**
     * Set props
     */
    set<Name extends string, Fn extends BaseHandler<State>>(name: Name, fn: Fn): Quark<Routes, State & { [K in Name]: AwaitedReturn<Fn> }> {
        // @ts-ignore
        return this.use(fn.constructor === AsyncFunction
            ? (fn.length === 0
                // @ts-ignore
                ? async (ctx) => { ctx[name] = await fn(); }
                // @ts-ignore
                : async (ctx) => { ctx[name] = await fn(ctx); }
            )
            : (fn.length === 0
                // @ts-ignore
                ? (ctx) => { ctx[name] = fn(); }
                // @ts-ignore
                : (ctx) => { ctx[name] = fn(ctx); }
            )
        );
    }

    /**
     * Build the fetch function
     */
    build() {
        const { routes } = this;
        const router = new Router();

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i];
            const [method] = route;

            if (method === null)
                router.handle(route[1], route[2]);
            else
                router.on(method, route[1], route[2]);
        }

        return router.build();
    }

    #fetch!: (req: Request, env: any, ctx: ExecutionContext) => any;
    /**
     * Get the fetch function
     */
    get fetch() {
        if (this.#fetch !== undefined) return this.#fetch;

        const fn = this.build();
        return this.#fetch = isCloudflare
            ? (req, env, ctx) => {
                const c = new Context(req);
                // @ts-ignore
                c.env = env;
                // @ts-ignore
                c.execution = ctx;

                return fn(c);
            }
            : (req) => fn(new Context(req));
    }

    #handleEvent!: (event: FetchEvent) => any;
    /**
     * Get the fetch handler function
     */
    get handleEvent() {
        if (this.#handleEvent !== undefined) return this.#handleEvent;

        const fn = this.build();
        return this.#handleEvent = (event) => {
            const c = new Context(event.request);
            // @ts-ignore
            c.event = event;

            event.respondWith(fn(c));
        }
    }

    /**
     * Register handlers
     */
    handle(method: string | null, path: string, ...handlers: BaseHandler<State>[]) {
        this.routes.push([method!, path, [...this.middlewares, ...handlers]]);
        return this;
    }

    /**
     * Do route merging
     */
    route(base: string, { routes }: BaseQuark) {
        const baseLen = base.length;

        if (baseLen === 1) {
            for (let i = 0, { length } = routes; i < length; ++i) {
                const route = routes[i];
                this.handle(route[0], route[1], ...route[2]);
            }

            return this;
        }

        if (base.charCodeAt(baseLen - 1) === 47)
            throw new Error('Base cannot end with a slash, instead recieved: ' + base);

        for (let i = 0, { length } = routes; i < length; ++i) {
            const route = routes[i];
            const path = route[1];

            this.handle(route[0], path.length === 1 ? base : base + path, ...route[2]);
        }

        return this;
    }

    /** @internal */
    // @ts-ignore
    get(...args: any[]): any {
        // @ts-ignore
        return this.handle('GET', ...args);
    }
    /** @internal */
    // @ts-ignore
    head(...args: any[]): any {
        // @ts-ignore
        return this.handle('HEAD', ...args);
    }
    /** @internal */
    // @ts-ignore
    post(...args: any[]): any {
        // @ts-ignore
        return this.handle('POST', ...args);
    }
    /** @internal */
    // @ts-ignore
    put(...args: any[]): any {
        // @ts-ignore
        return this.handle('PUT', ...args);
    }
    /** @internal */
    // @ts-ignore
    delete(...args: any[]): any {
        // @ts-ignore
        return this.handle('DELETE', ...args);
    }
    /** @internal */
    // @ts-ignore
    options(...args: any[]): any {
        // @ts-ignore
        return this.handle('OPTIONS', ...args);
    }
    /** @internal */
    // @ts-ignore
    any(...args: any[]): any {
        // @ts-ignore
        return this.handle(null, ...args);
    }
}

export interface Quark<Routes extends RoutesRecord, State> extends HandlerRegisters<Routes, State> { };
export type BaseQuark = Quark<RoutesRecord>;

export * from './utils/response';
export * from './utils/router';
export * from './types/handler';
export * from './types/response';
