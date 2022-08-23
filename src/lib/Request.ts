import Dispatcher, { HttpMethod } from "undici/types/dispatcher";
import undici from "undici";
import path from "path";

const defaultRedirectCount = 21;
const seconds = 1000;

export type UndiciOptions = Partial<
    { dispatcher?: Dispatcher } & Omit<Dispatcher.RequestOptions, "origin" | "path" | "method"> &
        Partial<Pick<Dispatcher.RequestOptions, "method">>
>;

export class Request {
    private url: URL;
    private httpMethod: HttpMethod = "GET";
    private data: Record<string, string> | string | null = null;
    private sendDataAs: string | null = null;
    private ua = `request/1.1.6 Node.js/${process.version.slice(1)} (+https://nodejs.org)`;

    private reqHeaders: Record<string, string> = {};
    private coreOptions: UndiciOptions = {};

    private timeoutDuration: number = 30 * seconds;
    private redirectCount: number = defaultRedirectCount;
    constructor(url: URL | string) {
        try {
            this.url = url instanceof URL ? url : typeof url === "string" ? new URL(url) : new URL(url);
        } catch (error) {
            throw new TypeError("Only absolute URLs are supported");
        }
    }

    // OPTIONS

    query(a1: Record<string, string> | string, a2?: string) {
        if (typeof a1 === "object") {
            Object.keys(a1).forEach((queryKey) => {
                this.url.searchParams.append(queryKey, a1[queryKey]);
            });
        } else this.url.searchParams.append(a1, String(a2));

        return this;
    }

    path(...relativePaths: string[]) {
        for (const relativePath of relativePaths) this.url.pathname = path.join(this.url.pathname, relativePath);

        return this;
    }

    body(data: Record<string, string> | string | URLSearchParams, sendAs?: string) {
        if (data instanceof URLSearchParams) this.sendDataAs = "form";
        else
            this.sendDataAs =
                typeof data === "object" && !sendAs && !Buffer.isBuffer(data) ? "json" : sendAs ? sendAs.toLowerCase() : "buffer";

        if (data instanceof URLSearchParams) this.data = new URLSearchParams(data).toString();
        else if (this.sendDataAs === "form" && typeof data === "object") this.data = new URLSearchParams(data).toString();
        else if (this.sendDataAs === "json") this.data = JSON.stringify(data);
        else this.data = data;

        return this;
    }

    header(a1: Record<string, string> | string, a2?: string) {
        if (typeof a1 === "object") {
            Object.keys(a1).forEach((headerName) => {
                this.reqHeaders[headerName.toLowerCase()] = a1[headerName];
            });
        } else this.reqHeaders[a1.toLowerCase()] = String(a2);

        return this;
    }

    timeout(timeout: number) {
        this.timeoutDuration = timeout * seconds;

        return this;
    }

    agent(...fragments: any[]) {
        this.ua = fragments.join(" ");

        return this;
    }

    options(a1: Record<string, string> | string, a2?: string) {
        if (typeof a1 === "object") {
            Object.keys(a1).forEach((option) => {
                this.coreOptions[option] = a1[option];
            });
        } else this.coreOptions[a1] = a2;

        return this;
    }

    auth(token: string, type = "Bearer") {
        this.reqHeaders["authorization"] = type ? `${type} ${token}` : token;

        return this;
    }

    follow(countOrBool: boolean | number) {
        if (typeof countOrBool === "number") this.redirectCount = countOrBool;
        else if (typeof countOrBool === "boolean")
            if (countOrBool) this.redirectCount = defaultRedirectCount;
            else this.redirectCount = 0;

        return this;
    }

    // HTTP METHODS

    method(method: HttpMethod) {
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

    json<T = any>(): Promise<T> {
        return this.send().then((res) => res.body.json());
    }

    raw(): Promise<ArrayBuffer> {
        return this.send().then((res) => res.body.arrayBuffer().then(Buffer.from));
    }

    text(): Promise<string> {
        return this.send().then((res) => res.body.text());
    }

    private send(): Promise<Dispatcher.ResponseData> {
        if (this.data) {
            if (!this.reqHeaders.hasOwnProperty("content-type")) {
                if (this.sendDataAs === "json") this.reqHeaders["content-type"] = "application/json";
                else if (this.sendDataAs === "form") this.reqHeaders["content-type"] = "application/x-www-form-urlencoded";
            }
        }

        this.header("user-agent", this.ua);

        const req = undici.request(this.url, {
            // @ts-ignore
            body: this.data,
            method: this.httpMethod,
            headers: this.reqHeaders,
            bodyTimeout: this.timeoutDuration,
            maxRedirections: this.redirectCount,
            ...this.coreOptions,
        });

        return req;
    }

    then(...args: any[]) {
        return this.send().then(...args);
    }

    catch(...args: any[]) {
        return this.send().catch(...args);
    }
}

const request = (url: string) => new Request(url);
export { request };
