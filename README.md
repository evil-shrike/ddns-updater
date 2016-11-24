# ddns-updater

> Library for updating dynamic DNS.

[![NPM](https://nodei.co/npm/ddns-updater.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ddns-updater/)

The library supports the following Dynamic DNS services:  
* [Namecheap](https://www.namecheap.com/)
* [NoIP](https://my.noip.com)

For external IP resolving it uses api.ipify.org service.


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
		"service"	: "namecheap",
		"name" 		: "chebyrashka.guru",
		"hosts"  	: ["@"],
		"settings"	: {
			"password": "1a111v11111111a1aaa11a11111111a1"
		}
	}],
    "interval"  	: { "seconds": 5 },
    "updateAlways"  : false
}
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
		"service"	: "namecheap",
		"name" 		: "chebyrashka.guru",
		"hosts"  	: ["@", "www"],
		"settings"	: {
			"password": "1a111v11111111a1aaa11a11111111a1"
		},
		enable: 	: false
	}, {
		"service"	: "noip",
		"name"		: "my-awesome-cloud.ddns.net",
		"settings"	: {
			"username": "me@google.com",
			"password": "my no-ip password"
		}
	}],
```  

#### interval
Type: Object  
How often to check external IP (and update if it's changed).  
Value: An object in terms of [interval](https://www.npmjs.com/package/interva).  
Example:  
```
{"days": 1}
```

#### updateAlways
Type: Boolean  
Default: `false`  
`true` to update IP every time (once in interval), otherwise update only if IP changed.  


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
Every service from config is a module in "updaters" folder. The tool expect every updater to implement the following API:
* module exports a class (will be created via `new`)
* updater class should implement `update` method:
```
/**
 * @param {String} domain
 * @param {String} host
 * @param {String} ip
 * @param {Object} settings
 * @return {Promise}
 */
function update (domain, host, ip, settings)
```


### Resolvers
Resolver is a module loaded from `resolvers` folder. Module should implement the following API:
* module exports a class (will be created via `new`)
* resolver class implements `resolve` method returning a Promise resolved to IP value

> Currently the only resolver supoorted is "api.ipify.org" 


## Acknowledgments

The package is inspired by:
* [node-dyndns-client](https://github.com/kersten/node-dyndns-client)
* [simple-dynamic-dns-client](https://github.com/symi/simple-dynamic-dns-client)


## License

MIT
