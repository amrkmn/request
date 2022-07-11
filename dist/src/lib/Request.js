"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const undici_1 = __importDefault(require("undici"));
const path_1 = __importDefault(require("path"));
const defaultRedirectCount = 21;
const seconds = 1000;
class Request {
    url;
    httpMethod;
    data;
    sendDataAs;
    reqHeaders;
    ua;
    coreOptions;
    timeoutDuration = 30 * seconds;
    redirectCount = defaultRedirectCount;
    constructor(url) {
        try {
            this.url = url instanceof URL ? url : typeof url === "string" ? new URL(url) : new URL(url);
        }
        catch (error) {
            throw new TypeError("Only absolute URLs are supported");
        }
    }
    query(a1, a2) {
        if (typeof a1 === "object") {
            Object.keys(a1).forEach((queryKey) => {
                this.url.searchParams.append(queryKey, a1[queryKey]);
            });
        }
        else
            this.url.searchParams.append(a1, a2);
        return this;
    }
    path(...relativePaths) {
        for (const relativePath of relativePaths)
            this.url.pathname = path_1.default.join(this.url.pathname, relativePath);
        return this;
    }
    body(data, sendAs) {
        if (data instanceof URLSearchParams)
            this.sendDataAs = "form";
        else
            this.sendDataAs =
                typeof data === "object" && !sendAs && !Buffer.isBuffer(data) ? "json" : sendAs ? sendAs.toLowerCase() : "buffer";
        if (data instanceof URLSearchParams)
            this.data = new URLSearchParams(data).toString();
        else if (this.sendDataAs === "form" && typeof data === "object")
            this.data = new URLSearchParams(data).toString();
        else if (this.sendDataAs === "json")
            this.data = JSON.stringify(data);
        else
            this.data = data;
        return this;
    }
    header(a1, a2) {
        if (typeof a1 === "object") {
            Object.keys(a1).forEach((headerName) => {
                this.reqHeaders[headerName.toLowerCase()] = a1[headerName];
            });
        }
        else
            this.reqHeaders[a1.toLowerCase()] = a2;
        return this;
    }
    timeout(timeout) {
        this.timeoutDuration = timeout * seconds;
        return this;
    }
    agent(...fragments) {
        this.ua = fragments.join(" ");
        return this;
    }
    options(a1, a2) {
        if (typeof a1 === "object") {
            Object.keys(a1).forEach((option) => {
                this.coreOptions[option] = a1[option];
            });
        }
        else
            this.coreOptions[a1] = a2;
        return this;
    }
    auth(token, type = "Bearer") {
        this.reqHeaders["authorization"] = type ? `${type} ${token}` : token;
        return this;
    }
    follow(countOrBool) {
        if (typeof countOrBool === "number")
            this.redirectCount = countOrBool;
        else if (typeof countOrBool === "boolean")
            if (countOrBool)
                this.redirectCount = defaultRedirectCount;
            else
                this.redirectCount = 0;
        return this;
    }
    // HTTP METHODS
    method(method) {
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
    json() {
        return this.send().then((res) => res.body.json());
    }
    raw() {
        return this.send().then((res) => res.body.arrayBuffer().then(Buffer.from));
    }
    text() {
        return this.send().then((res) => res.body.text());
    }
    send() {
        if (this.data) {
            if (!this.reqHeaders.hasOwnProperty("content-type")) {
                if (this.sendDataAs === "json")
                    this.reqHeaders["content-type"] = "application/json";
                else if (this.sendDataAs === "form")
                    this.reqHeaders["content-type"] = "application/x-www-form-urlencoded";
            }
        }
        this.header("user-agent", this.ua);
        const req = undici_1.default.request(this.url, {
            body: this.data,
            method: this.httpMethod,
            headers: this.reqHeaders,
            bodyTimeout: this.timeoutDuration,
            maxRedirections: this.redirectCount,
            ...this.coreOptions,
        });
        return req;
    }
    then(...args) {
        return this.send().then(...args);
    }
    catch(...args) {
        return this.send().catch(...args);
    }
}
exports.Request = Request;
//# sourceMappingURL=Request.js.map