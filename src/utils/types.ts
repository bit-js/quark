export type MaybePromise<T> = T | Promise<T>;
export type AwaitedReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;
export type Promisify<T> = T extends Promise<any> ? T : Promise<T>;

export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

export type UnionToIntersection<T> =
    (T extends any ? (x: T) => any : never) extends
    (x: infer R) => any ? R : never;