import type { BaseQuark } from '../server';
import { Client, type ClientType, type ClientOptions } from './client';

/**
 * A type safe client
 */
export function client<T extends BaseQuark>(url: string, options?: ClientOptions): ClientType<T> {
    return options === undefined ? new Client(url) : new Client(url, options) as any;
}

// Types
export * from './types/route';
export * from './types/request';

// Client internals
export * from './client';
export { default as stringifyQuery } from './utils/stringifyQuery';
export { default as serialize } from './utils/serialize';
export { default as getInjectFn } from './utils/pathInject';