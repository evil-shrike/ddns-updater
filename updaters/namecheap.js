var request = require("request-promise");
var querystring = require("querystring");
var parseString = require("xml2js").parseString;

var Updater = function () {
    this.baseUrl = 'https://dynamicdns.park-your-domain.com/update';
    this.options = {
        //url: "",
        //json: true
    };
}

Updater.prototype.update = function (domain, host, ip, settings) {
    var url = this.generateUrl(domain, host, ip, settings.password);
    //console.log("Updating IP via " + url);
    return request(url, this.options)
        .then(function (res) {
            //console.log(res);
            var result; 
            parseString(res, function (err, res) {
                if (err) {
                    throw new Error(err);
                } else {
                    result = res;
                }
            });
            console.log(result);
            /* Expected response:
            <?xml version="1.0"?>
            <interface-response>
                <Command>SETDNSHOST</Command>
                <Language>eng</Language>
                <IP>1.2.3.4</IP>
                <ErrCount>0</ErrCount>
                <ResponseCount>0</ResponseCount>
                <Done>true</Done>
                <debug><![CDATA[]]></debug>
            </interface-response>
            */
            var resultRoot = result['interface-response'];
            //console.log(resultRoot);
            if (resultRoot.ErrCount[0] !== '0') {
                throw new Error(resultRoot);
            } else {
                return true;
            }
        });
}

Updater.prototype.generateUrl = function(domain, host, ip, password) {
    return this.baseUrl + '?' + querystring.stringify({
        domain: domain,
        host: host,
        password: password,
        ip: ip
    });
}

module.exports = Updater;

