import { Request } from "./lib/Request";

function makeRequest(url: string | URL) {
    return new Request(url);
}

export { Request };
export const request = (url: string | URL) => new Request(url);
export default makeRequest;
