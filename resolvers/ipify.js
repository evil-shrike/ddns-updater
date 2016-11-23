var request = require("request-promise");

var Resolver = function () {
    this.options = {
        url: "https://api.ipify.org?format=json",
        json: true
    };
}

Resolver.prototype.resolve = function () {
    return request(this.options)
        .then(function (res) {
            //console.log(res);
            return res.ip;
        });
}

module.exports = Resolver;

