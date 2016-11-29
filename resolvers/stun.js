var stun = require("vs-stun");
var Promise = require("bluebird");
var connect = Promise.promisify(stun.connect);

var Resolver = function (host, port) {
    this.server = { host: host || "stun.l.google.com", port: port || 19302 };
}

Resolver.prototype.resolve = function () {

    return connect(this.server).then(function (response) {
        var ip = response.stun && response.stun.public && response.stun.public.host; 
        response.close();
        return ip;
    });
}

module.exports = Resolver;

