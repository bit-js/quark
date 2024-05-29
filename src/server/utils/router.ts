import { internal } from '@bit-js/blitz';

import type { BaseContext, BaseHandler } from '../types/handler';

type Result = internal.Edge<BaseHandler[]>;

const noop = () => null;
const options = {};

export default class Router {
    /**
     * Map method routers
     */
    methodRouter?: Record<string, Result>;

    /**
     * Fallback router if methods do not match
     */
    fallbackRouter?: Result;

    /**
     * Register a handler
     */
    on(method: string, path: string, handlers: BaseHandler[]) {
        ((this.methodRouter ??= {})[method] ??= new internal.Edge()).on(path, handlers);
    }

    /**
     * Register a handler for all method
     */
    handle(path: string, handlers: BaseHandler[]) {
        (this.fallbackRouter ??= new internal.Edge()).on(path, handlers);
    }

    /**
     * Build the request handler
     */
    build(): (ctx: BaseContext) => any {
        const { methodRouter, fallbackRouter } = this;
        const fallback = typeof fallbackRouter === 'undefined'
            ? noop
            : fallbackRouter.buildMatcher(options, null);

        // Use fallbackRouter matcher as fallback if it exist
        // Call the fallback directly if no method router exists
        if (typeof methodRouter === 'undefined') {
            return (ctx) => {
                const res = fallback(ctx);
                if (res === null) return new Response(`Cannot ${ctx.req.method} ${ctx.path}`);

                ctx.handlers = res;
                return ctx.next();
            };
        }

        // Compile method matchers 
        const methodMatcher = new MethodMatcher();
        for (const method in methodRouter)
            methodMatcher[method] = methodRouter[method].buildMatcher(options, null);

        return (ctx) => {
            const res = (methodMatcher[ctx.req.method] ?? fallback)(ctx);
            if (res === null) return new Response(`Cannot ${ctx.req.method} ${ctx.path}`);

            ctx.handlers = res;
            return ctx.next();
        };
    }
}

type Matcher = (c: BaseContext) => BaseHandler[] | null;

class MethodMatcher {
    GET!: Matcher;
    POST!: Matcher;
    PUT!: Matcher;
    PATCH!: Matcher;
    OPTIONS!: Matcher;
    TRACE!: Matcher;
    HEAD!: Matcher;
}

interface MethodMatcher extends Record<string, Matcher> { };
