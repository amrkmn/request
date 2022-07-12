const Request = require("../lib/Request");

const makeRequest = (url) => new Request(url);

module.exports.request = makeRequest;
module.exports.Request = Request;
module.exports.default = makeRequest;
