import { join } from "path";
import undici, { Dispatcher } from "undici";
import { RestOrArray, normalizeArray } from "./utils";

const VERSION = "[VI]{{inject}}[/VI]";
const DEFAULT_REDIRECT_COUNT = 21;
const SECONDS = 1000;

export type UndiciOptions = Partial<
    { dispatcher?: Dispatcher } & Omit<Dispatcher.RequestOptions, "origin" | "path" | "method"> &
        Partial<Pick<Dispatcher.RequestOptions, "method">>
>;

export class Request {
    private url: URL;
    private httpMethod: Dispatcher.HttpMethod = "GET";
    private data: Record<string, any> | string | null = null;
    private sendDataAs: string | null = null;
    private ua = `@aytea.request/${VERSION} (+https://npm.im/@aytea/request) Node.js/${process.version.slice(
        1
    )} (+https://nodejs.org)`;

    private reqHeaders: Record<string, string> = {};
    private coreOptions: UndiciOptions = {};

    private timeoutDuration: number = 30 * SECONDS;
    private redirectCount: number = DEFAULT_REDIRECT_COUNT;
    constructor(url: URL | string) {
        try {
            this.url = url instanceof URL ? url : typeof url === "string" ? new URL(url) : new URL(url);
        } catch (error) {
            throw new TypeError("Only absolute URLs are supported");
        }
    }

    // OPTIONS
    query(obj: Record<string, any>): this;
    query(name: string, value: string): this;
    query(a1: Record<string, any> | string, a2?: string) {
        if (typeof a1 === "object") {
            Object.keys(a1).forEach((queryKey) => {
                this.url.searchParams.append(queryKey, a1[queryKey]);
            });
        } else this.url.searchParams.append(a1, String(a2));

        return this;
    }
    path(...relativePaths: RestOrArray<string>) {
        for (const relativePath of [...normalizeArray(relativePaths)]) {
            this.url.pathname = join(this.url.pathname, relativePath);
        }

        return this;
    }
    body(data: Record<string, any>, sendAs?: string): this;
    body(data: string, sendAs?: string): this;
    body(data: URLSearchParams, sendAs?: string): this;
    body(data: Record<string, any> | string | URLSearchParams, sendAs?: string) {
        if (data instanceof URLSearchParams) this.sendDataAs = "form";
        else
            this.sendDataAs =
                typeof data === "object" && !sendAs && !Buffer.isBuffer(data) ? "json" : sendAs ? sendAs.toLowerCase() : "buffer";

        if (data instanceof URLSearchParams) this.data = data.toString();
        else if (this.sendDataAs === "form" && typeof data === "object" && !Buffer.isBuffer(data))
            this.data = new URLSearchParams(data).toString();
        else if (this.sendDataAs === "json") this.data = JSON.stringify(data);
        else this.data = data;

        return this;
    }
    header(obj: Record<string, any>): this;
    header(name: string, value: string): this;
    header(a1: Record<string, any> | string, a2?: string) {
        if (typeof a1 === "object") {
            Object.keys(a1).forEach((headerName) => {
                this.reqHeaders[headerName.toLowerCase()] = a1[headerName];
            });
        } else this.reqHeaders[a1.toLowerCase()] = String(a2);

        return this;
    }
    timeout(timeout: number) {
        this.timeoutDuration = timeout;

        return this;
    }
    agent(...fragments: RestOrArray<string>) {
        this.ua = [...normalizeArray(fragments)].join(" ");

        return this;
    }
    options(obj: UndiciOptions): this;
    options<T extends keyof UndiciOptions>(key: T, value: UndiciOptions[T]): this;
    options<T extends keyof UndiciOptions>(a1: UndiciOptions | T, a2?: UndiciOptions[T]) {
        if (typeof a1 === "object") {
            Object.keys(a1).forEach((option) => {
                this.coreOptions[option] = a1[option];
            });
        } else this.coreOptions[a1] = a2;

        return this;
    }
    auth(token: string, type?: string) {
        this.reqHeaders["authorization"] = type ? `${type} ${token}` : token;

        return this;
    }
    follow(countOrBool: boolean | number) {
        if (typeof countOrBool === "number") this.redirectCount = countOrBool;
        else if (typeof countOrBool === "boolean")
            if (countOrBool) this.redirectCount = DEFAULT_REDIRECT_COUNT;
            else this.redirectCount = 0;

        return this;
    }

    // HTTP METHODS
    method(method: Dispatcher.HttpMethod) {
        this.httpMethod = method;

        return this;
    }
    get() {
        return this.method("GET");
    }
    post() {
        return this.method("POST");
    }
    patch() {
        return this.method("PATCH");
    }
    put() {
        return this.method("PUT");
    }
    delete() {
        return this.method("DELETE");
    }

    // RESPONSE MODIFIERS
    async json<T = any>(): Promise<T> {
        return this.send().then((res) => res.body.json());
    }
    async buffer() {
        return this.send().then((res) => res.body.arrayBuffer().then(Buffer.from));
    }
    async arrayBuffer() {
        return this.send().then((res) => res.body.arrayBuffer());
    }
    async text() {
        return this.send().then((res) => res.body.text());
    }
    async blob() {
        return this.send().then((res) => res.body.blob());
    }
    async result() {
        return this.send();
    }
    private async send(): Promise<Dispatcher.ResponseData> {
        if (this.data) {
            if (!this.reqHeaders.hasOwnProperty("content-type")) {
                if (this.sendDataAs === "json") this.reqHeaders["content-type"] = "application/json";
                else if (this.sendDataAs === "form") this.reqHeaders["content-type"] = "application/x-www-form-urlencoded";
            }
        }

        this.header("user-agent", this.ua);

        const options = Object.assign(
            {
                body: this.data,
                method: this.httpMethod,
                headers: this.reqHeaders,
                bodyTimeout: this.timeoutDuration,
                maxRedirections: this.redirectCount,
                ...this.coreOptions,
            },
            this.coreOptions
        );

        const req = undici.request(this.url, options);

        return req;
    }

    then(onfulfilled?: (value: Dispatcher.ResponseData) => any) {
        return this.send().then(onfulfilled);
    }
    catch(onrejected?: (reason: any) => any) {
        return this.send().catch(onrejected);
    }
}

function request(url: URL | string) {
    return new Request(url);
}
export { request, request as default, VERSION as version };
