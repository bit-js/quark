import type { BaseHandler } from '../server';

type Values = string | string[];

export interface CORSOptions {
    allowOrigin?: string;
    allowMethods?: Values;
    exposeHeaders?: Values;
    maxAge?: number;
    allowCredentials?: boolean;
    allowHeaders?: Values;
}

function parseValue(value: Values) {
    return typeof value === 'string' ? value : value.join(',');
}

/**
 * Create a CORS action function
 */
export function cors(options?: CORSOptions): BaseHandler {
    const headers: Record<string, string> = {};

    if (typeof options === 'undefined')
        headers['Access-Control-Allow-Headers'] = '*';
    else {
        // Check basic properties
        if (typeof options.allowHeaders !== 'undefined')
            headers['Access-Control-Allow-Headers'] = parseValue(options.allowHeaders);
        if (typeof options.allowMethods !== 'undefined')
            headers['Access-Control-Allow-Methods'] = parseValue(options.allowMethods);
        if (typeof options.exposeHeaders !== 'undefined')
            headers['Access-Control-Expose-Headers'] = parseValue(options.exposeHeaders);
        if (typeof options.maxAge === 'number')
            headers['Access-Control-Max-Age'] = options.maxAge + '';
        if (options.allowCredentials === true)
            headers['Access-Control-Allow-Credentials'] = 'true';

        // Check allow origins
        if (typeof options.allowOrigin === 'string' && options.allowOrigin !== '*') {
            headers['Access-Control-Allow-Origin'] = options.allowOrigin;
            headers.Vary = 'Origin';
        } else headers['Access-Control-Allow-Origin'] = '*';
    }

    return (ctx) => {
        Object.assign(ctx.headers, headers);
        return ctx.next();
    }
}
