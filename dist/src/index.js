"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = exports.Request = void 0;
const Request_1 = require("./lib/Request");
Object.defineProperty(exports, "Request", { enumerable: true, get: function () { return Request_1.Request; } });
function makeRequest(url) {
    return new Request_1.Request(url);
}
const request = (url) => new Request_1.Request(url);
exports.request = request;
exports.default = makeRequest;
//# sourceMappingURL=index.js.map