import { Request } from "./lib/Request";
declare function makeRequest(url: string | URL): Request;
export { Request };
export declare const request: (url: string | URL) => Request;
export default makeRequest;
