import { Dispatcher } from "undici";
import { HttpMethod } from "undici/types/dispatcher";
export declare type UndiciOptions = Partial<{
    dispatcher?: Dispatcher;
} & Omit<Dispatcher.RequestOptions, "origin" | "path" | "method"> & Partial<Pick<Dispatcher.RequestOptions, "method">>>;
export declare class Request {
    private url;
    private httpMethod;
    private data;
    private sendDataAs;
    private reqHeaders;
    private ua;
    private coreOptions;
    private timeoutDuration;
    private redirectCount;
    constructor(url: string | URL);
    query(a1: Record<string, string> | string, a2: string): this;
    path(...relativePaths: string[]): this;
    body(data: any, sendAs?: string): this;
    header(a1: Record<string, string> | string, a2?: string): this;
    timeout(timeout: number): this;
    agent(...fragments: string[]): this;
    options(a1: UndiciOptions | string, a2?: string): this;
    auth(token: string, type?: string): this;
    follow(countOrBool: number | boolean): this;
    method(method: HttpMethod): this;
    get(): this;
    post(): this;
    patch(): this;
    put(): this;
    delete(): this;
    json<T = any>(): Promise<T>;
    raw(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    send(): Promise<Dispatcher.ResponseData>;
    then(...args: any[]): Promise<Dispatcher.ResponseData>;
    catch(...args: any[]): Promise<Dispatcher.ResponseData>;
}
