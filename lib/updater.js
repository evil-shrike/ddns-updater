"use strict";

var EventEmitter = require("events");
var util         = require("util");
var request      = require("request");
var interval     = require("interval");
var fs           = require("fs");
var format       = require("date-format");

/**
 * @param {Object} config
 * @param {Array} config.mappings
 * @param {String} config.interval
 * @param {Boolean} config.updateAlways
 */
function DDNSUpdater(config) {
    EventEmitter.call(this);

    var that = this;
    that.errors = {};
    that.updaters = {};
    if (!config.domains || !config.domains.length) {
        throw new Error("At one domain should be specified in config");
    }
    config.domains.forEach(function (domain) {
        if (!domain.name) throw new Error("Domain has no name");
        if (!domain.service) throw new Error("Domain has no service");
        /*if (!domain.hosts || !domain.hosts.length) {
            throw new Error("Domain has no hosts");
        }*/
        if (!domain.hosts || !domain.hosts.length) {
            domain.hosts = [""];
        }
        if (!that.updaters[domain.service]) {
            var Updater = require("../updaters/" + domain.service + ".js");
            that.updaters[domain.service] = new Updater();
        }
    });

    // TODO: static defaultOptions
    this.config = config;

    // init interval
    if (this.config.interval) {
        this.interval =  interval(this.config.interval);
    } else {
        this.interval = 60*60*1000; // 1 hour
    }
    // init IP resolver
    
    this.config.resolver = this.config.resolver|| "ipify";
    var Resolver = require("../resolvers/" + this.config.resolver + ".js");
    this.resolver = new Resolver();
}

util.inherits(DDNSUpdater, EventEmitter);

DDNSUpdater.prototype.start = function () {
    this._timer = setInterval(this.runner.bind(this), this.interval);
    console.log("Started.");
    this.runner();
}

DDNSUpdater.prototype.runner = function () {
    var that = this;
    var now = format.asString('dd/MM hh:mm:ss', new Date())
    console.log("["+ now + "] Checking. Next check in " + interval.stringify(this.interval));
    that.resolveIp().then(function (ip) {
        that.emit("ip:resolve:success", that.config.resolver, ip);
        var oldIp = that.ip;
        that.ip = ip;
        if (ip && (ip !== oldIp || that.config.updateAlways)) {
            if (ip !== oldIp) {
                that.emit("ip:change", ip, oldIp);
            }
            that.update(ip);
        }
    }, function (err) {
        that.reportError(that.config.resolver, err);
        that.emit("ip:resolve:error", that.config.resolver, err);
    });
}

DDNSUpdater.prototype.resolveIp = function () {
    return this.resolver.resolve();
}

DDNSUpdater.prototype.update = function (ip) {
    //console.log('updating to ' + ip );
    var that = this;
    that.config.domains.forEach(function (domain) {
        if (domain.enable === false) { return; }
        domain.hosts.forEach(function (host) {
            that.updaters[domain.service].update(domain.name, host, ip, domain.settings)
                .then(function (res) {
                    //
                    that.emit("update:success", {
                        service: domain.service,
                        name: domain.name,
                        host: host
                    });
                }, function (err) {
                    //
                    that.reportError(domain.service, err);                    
                    that.emit("update:error", err, {
                        service: domain.service,
                        name: domain.name,
                        host: host
                    });
                });
        });
    });
}

DDNSUpdater.prototype.reportError = function (service, err) {
    this.errors[service] = (this.errors[service]||0) + 1;
    fs.writeFileSync(".errors_stat", JSON.stringify(this.errors));
    fs.writeFileSync(".last_error", JSON.stringify(err));
}

DDNSUpdater.prototype.stop = function () {
    clearInterval(this._timer);
}

module.exports = DDNSUpdater;