# ddns-updater

> Library for updating dynamic DNS.

The library supports the following Dynamic DNS services:  
* [Namecheap](https://www.namecheap.com/)

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
An array of objects describing domain.  
Every object in tge array:
* `service` - Dynamic DNS service. e.g. "namecheap". Every supported service should have a corresponding module in 'updaters' folder.  
* `name` - name of domain, e.g. "example.com"  
* `hosts` - array of host to map to the domain, if only only want naked domain ("example.com") specify "@".  
* `settings` - an object specific for the servuce, usually containing auth info.  

#### interval
Type: Object  
How often check external IP (and update if it changed).  
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


## Acknowledgments

The package is inspired by:
* [node-dyndns-client](https://github.com/kersten/node-dyndns-client)
* [simple-dynamic-dns-client](https://github.com/symi/simple-dynamic-dns-client)


## License

MIT
