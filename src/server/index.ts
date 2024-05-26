import type { RequestMethod } from '../utils/methods';
import type { BaseHandler } from './types/handler';
import Router from './utils/router';

export type Route = [method: string, path: string, handlers: BaseHandler[]];
export type RoutesRecord = Route[];

interface Register<Method extends string, Routes extends RoutesRecord> {
    <
        Path extends string, 
        Handlers extends BaseHandler[]
    >(path: Path, ...handlers: Handlers): Quark<[...Routes, [Method, Path, Handlers]]>
}
type HandlerRegisters<T extends RoutesRecord> = {
    [Method in RequestMethod | 'any']: Register<Method, T>;
}

declare global {
    interface Env {}
}

export class Quark<Routes extends RoutesRecord = []> {
    readonly middlewares: BaseHandler[];
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
    use(f: BaseHandler) {
        this.middlewares.push(f);
        return this;
    }

    #fetch: any;

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

        return this.#fetch = router.build();
    }

    /**
     * Get the fetch function
     */
    get fetch(): (req: Request) => any {
        return this.#fetch ??= this.build();
    }

    /**
     * Register handlers
     */
    handle(method: string | null, path: string, ...handlers: BaseHandler[]) {
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
        } else {
            if (base.charCodeAt(baseLen - 1) === 47)
                throw new Error('Base cannot end with a slash, instead recieved: ' + base);

            for (let i = 0, { length } = routes; i < length; ++i) {
                const route = routes[i];
                const path = route[1];

                this.handle(route[0], path.length === 1 ? base : base + path, ...route[2]);
            }
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

export interface Quark<Routes extends RoutesRecord> extends HandlerRegisters<Routes> {};
export type BaseQuark = Quark<RoutesRecord>;

export * from './utils/response';
export * from './utils/router';
export * from './types/handler';
export * from './types/response';
