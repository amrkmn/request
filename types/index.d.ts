import Dispatcher from "undici/types/dispatcher";

declare class RequestClass extends Promise<Dispatcher.ResponseData> {
    private url: URL;
    private httpMethod: string;
    private data: any;
    private sendDataAs: any;
    private reqHeaders: Record<string, string>;
    private streamEnabled: boolean;
    private compressionEnabled: boolean;
    private ua: string;
    private coreOptions: request.UndiciOptions;
    private timeoutDuration: number;
    private redirectCount: number;

    constructor(url: string | URL);

    //#region Options

    query(obj: Record<string, any>): this;
    query(name: string, value: string): this;
    path(...relativePaths: string[]): this;
    body(data: any, sendAs?: string): this;
    header(obj: Record<string, any>): this;
    header(name: string, value: string): this;
    timeout(timeout: number): this;
    agent(...fragments: string[]): this;
    options(obj: request.UndiciOptions): this;
    options<T extends keyof request.UndiciOptions>(key: T, value: request.UndiciOptions[T]): this;
    auth(token: string, type?: string): this;
    follow(count: number | boolean): this;

    //#endregion

    //#region HTTP methods

    method(method: string): this;
    get(): this;
    post(): this;
    patch(): this;
    put(): this;
    delete(): this;

    //#endregion

    json<T = any>(): Promise<T>;
    raw(): Promise<ArrayBuffer>;

    text(): Promise<string>;
    send(): Promise<Dispatcher.ResponseData>;
}

declare namespace request {
    export class Request extends RequestClass {}
    export type Response = Dispatcher.ResponseData;
    export type UndiciOptions = Partial<
        { dispatcher?: Dispatcher } & Omit<Dispatcher.RequestOptions, "origin" | "path" | "method"> &
            Partial<Pick<Dispatcher.RequestOptions, "method">>
    >;
}
declare function request(url: string | URL): request.Request;

export { request };
export default request;
