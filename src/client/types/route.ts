import type { Route, GenericResponse, RoutesRecord, BaseHandler } from '../../server';
import type { Promisify, RequiredKeys, AwaitedReturn } from '../../utils/types';
import type { RequestBaseProps, RequestProps } from './request';

type InferReturn<T extends BaseHandler[]> = T extends [infer Current extends BaseHandler, ... infer Rest extends BaseHandler[]]
    ? AwaitedReturn<Current> | InferReturn<Rest>
    : never;

// Infer a single route
type RouteFunc<Path extends string, Init, Return> =
    // Force to provide additional fields if exists
    RequiredKeys<Init> extends never
    ? (path: Path, init?: RequestBaseProps) => Promisify<Return>
    : (path: Path, init: Init) => Promisify<Return>;

export type InferRoute<T extends Route> = {
    [K in T[0]]: RouteFunc<T[1], RequestProps<T>, InferReturn<T[2]>>;
};

export type InferRoutes<T extends RoutesRecord> = T extends [infer Current extends Route, ...infer Rest extends RoutesRecord]
    ? InferRoute<Current> | InferRoutes<Rest> : never;