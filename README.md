# ddns-updater

> Library for updating dynamic DNS.

[![NPM](https://nodei.co/npm/ddns-updater.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ddns-updater/)

The library supports the following Dynamic DNS services:  
* [Namecheap](https://www.namecheap.com/)
* [NoIP](https://my.noip.com)

For external IP resolving it uses service:
* https://ipify.org
* [STUN](http://www.ietf.org/rfc/rfc5389.txt) Google server


> [Introduction blog post](https://techblog.dorogin.com/dynamic-dns-updater-38a352ee02f5) with details on how the package can be used in QNAP NAS.


## Usage

```js
var UpdaterClient = require("ddns-updater");
var config = require('./config.json');
var updater = new UpdaterClient(config);
updater.start();
```

where `config.json`:
```json
{
    "domains" : [{
        "service"   : "namecheap",
        "name"      : "chebyrashka.guru",
        "hosts"     : ["@"],
        "settings"  : {
            "password": "1a111v11111111a1aaa11a11111111a1"
        }
    }],
    "interval"      : { "hours": 1 },
    "updateAlways"  : false
}
```

It makes sense to run the package via [pm2](https://www.npmjs.com/package/pm2) or the similar.

### More advanced usage
```js
var UpdaterClient = require("ddns-updater");
var config = { /* skipped*/ };
var updater = new UpdaterClient(config);

updater.on('ip:resolve:success', function (service, ip) {
    console.log('External IP resolved via ' + service + ' : ' + ip);
});

updater.on('ip:resolve:error', function (service, err) {
    .log('Failed to resolve external IP: ');
    console.log(err);
});

updater.on('ip:change', function (newIP, oldIP) {
    console.log("IP changed from " + oldIP + " to " + newIP);
});

updater.on('update:success', function (domain) {
    console.log("updated: " + JSON.stringify(domain));
});

updater.on('update:error', function (err, domain) {
    console.log('Failed to update IP via ' + domain.service + ':');
    console.log(err);
});

updater.start();
```

## API

### Config
#### domains
Type: Array  
An array of objects describing a domain.  
Every object in the array:
* `service` - name of Dynamic DNS service. e.g. "namecheap". Every supported service should have a corresponding module in 'updaters' folder (module file name w/o extension equals to service name, e.g. `namecheap.js` for "namecheap" service).  
* `name` - name of domain, e.g. "example.com"  
* `hosts` - array of host to map to the domain, if you only want naked domain ("example.com") specify "@" or omit field completely.  
* `settings` - an object specific for the service, usually containing auth info.
* `enable` - setting to `false` allow to ignore domain updating (useful to temporary disable) 

Example:
```json
    "domains" : [{
        "service"  : "namecheap",
        "name"     : "chebyrashka.guru",
        "hosts"    : ["@", "www"],
        "settings" : {
            "password": "1a111v11111111a1aaa11a11111111a1"
        },
        "enable"   :  false
    }, {
        "service"  : "noip",
        "name"     : "my-awesome-cloud.ddns.net",
        "settings" : {
            "username": "me@google.com",
            "password": "my no-ip password"
        }
    }],
```  

#### interval
Type: Object  
How often to check external IP (and update if it's changed).  
Value: An object in terms of [interval](https://www.npmjs.com/package/interva).  
Default: 1 hour    
Example:  
```json
"internal": {"days": 1}
```

#### updateAlways
Type: Boolean  
Default: `false`  
`true` to update IP every time (once in interval), otherwise update only if IP changed.  


#### resolver
Type: String  
Default: "ipify"  
Name of public IP resolve service. Currently supported:  
* "ipify" (default) - via https://ipify.org
* "stun" - via [STUN](http://www.ietf.org/rfc/rfc5389.txt) (Google server will be used)


#### updaters
Type: Object  
An object with mapping of service name to updater class.

See [Updaters](#Updaters) below.


### Events

#### "ip:resolve:success"
External IP was resolved. 
Arguments:  
* `service` (String) - service name used for resolving
* `ip` (String) - IP address

#### "ip:resolve:error"
An error occurred during IP resolving.  
Arguments:  
* `service` (String) - service name used for resolving
* `err` (Object) - error

#### "ip:change"
External IP change was detected.  
Arguments:  
* `newIP` (String) - new IP
* `oldIP` (String) - old IP


#### "update:success"
IP update successully completed.  
Arguments:  
* `domain` (Object):
 * `service` (String)
 * `name` (String)
 * `host` (String)

#### "update:error"
An error occured during updating IP.  
Arguments:  
* `err` (Object)
* `domain` (Object):
 * `service` (String)
 * `name` (String)
 * `host` (String)


### Updaters
Every service from config (`domains[].service`) is an Updater module.
The tool expects every updater to implement the following API:
* module exports a class (will be created via `new`)
* updater class should implement `update` method:
```js
/**
 * @param {String} domain
 * @param {String} host
 * @param {String} ip
 * @param {Object} settings
 * @return {Promise}
 */
function update (domain, host, ip, settings)
```
By default tool loads updaters from `updaters` folder. By you can specify them explicitly with `updaters` option:
```js
var UpdaterClient = require("ddns-updater");
var SomeUpdater = require("ddns-updater-someservice");
var config = require('./config.json');
config.updaters = {"some": SomeUpdater};
var updater = new UpdaterClient(config);
```


### Resolvers
Resolver is a module loaded from `resolvers` folder. Module should implement the following API:
* module exports a class (will be created via `new`)
* resolver class implements `resolve` method returning a Promise resolved to IP value

Name of resolver to use is specified in `resolver` config option.


## Acknowledgments

The package was inspired by:
* [node-dyndns-client](https://github.com/kersten/node-dyndns-client)
* [simple-dynamic-dns-client](https://github.com/symi/simple-dynamic-dns-client)


## License

MIT
