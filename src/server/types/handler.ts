import type { Params } from '@bit-js/blitz';
import type { BasicResponse, JsonResponse, NullableBody } from '../utils/response';
import type { CommonHeaders, CommonResponseInit } from './response';

export class Context<Params> implements CommonResponseInit {
    status!: number;
    headers: CommonHeaders;

    readonly path: string;
    readonly pathStart: number;
    readonly pathEnd: number;
    readonly params!: Params;

    readonly req: Request;
    readonly env!: Env;
    readonly execution!: ExecutionContext;

    handlerIdx: number;
    handlers!: BaseHandler[];
    
    /**
     * Parse the request
     */
    constructor(req: Request) {
        this.req = req;
        this.headers = {};
        this.handlerIdx = -1;

        // Path parsing
        const { url } = req;
        const start = url.indexOf('/', 12);
        const end = url.indexOf('?', start + 1);
        const pathEnd = end === -1 ? url.length : end;

        this.pathStart = start;
        this.pathEnd = pathEnd;
        this.path = url.substring(start, pathEnd);
    }

    /**
     * Send a `BodyInit` as response
     */
    body<const T extends NullableBody>(body: T): BasicResponse<T> {
        return new Response(body, this as ResponseInit) as any;
    }

    /**
     * Send response as JSON
     */
    json<const T>(body: T): JsonResponse<T> {
        this.headers['Content-Type'] = 'application/json';
        return new Response(JSON.stringify(body), this as ResponseInit);
    }

    /**
     * Send HTML response
     */
    html<const T extends NullableBody>(body: T): BasicResponse<T> {
        this.headers['Content-Type'] = 'text/html';
        return new Response(body, this as ResponseInit) as any;
    }

    /**
     * Send HTML response
     */
    redirect(location: string, status: 301 | 302 | 307 | 308): Response {
        this.headers.Location = location;
        this.status = status;
        return new Response(null, this as ResponseInit);
    }

    /**
     * Call the next middleware
     */
    next() {
        return this.handlers[++this.handlerIdx](this);
    }
};

export type BaseContext = Context<any>;

export type Handler<Path extends string> = (c: Context<Params<Path>>) => any;
export type BaseHandler = (c: BaseContext) => any;