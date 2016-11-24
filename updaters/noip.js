var request = require("request-promise");
var querystring = require("querystring");

var Updater = function () {
    this.baseUrl = "https://dynupdate.no-ip.com/nic/update";
}

Updater.prototype.update = function (domain, host, ip, settings) {
    var url = this.generateUrl(domain, host, ip);
    //console.log("Updating IP via " + url);
    var req = {
        url: url,
        auth: {
            user: settings.username,
            pass: settings.password,
        },
        headers: {
            "User-Agent": "ddns-updater (nodejs package)"
        }
    };
    return request(req)
        .then(function (res) {
            console.log(res);

            // Responses: http://www.noip.com/integrate/response
            /*
good IP_ADDRESS	Success	DNS hostname update successful. Followed by a space and the IP address it was updated to.
nochg IP_ADDRESS	Success	IP address is current, no update performed. Followed by a space and the IP address that it is currently set to.
nohost	Error	Hostname supplied does not exist under specified account, client exit and require user to enter new login credentials before performing an additional request.
badauth	Error	Invalid username password combination
badagent	Error	Client disabled. Client should exit and not perform any more updates without user intervention.
!donator	Error	An update request was sent including a feature that is not available to that particular user such as offline options.
abuse	Error	Username is blocked due to abuse. Either for not following our update specifications or disabled due to violation of the No-IP terms of service. Our terms of service can be viewed here. Client should stop sending updates.
911	    Error	A fatal error on our side such as a database outage. Retry the update no sooner than 30 minutes.            
             */
            // good 127.0.0.1
            if (!res) {
                throw new Error("Empty response");
            }
            if (res.indexOf("good ") >= 0 || res.indexOf("nochg ") >= 0) {
                return true;
            }
            throw new Error(res);
        });
}

Updater.prototype.generateUrl = function(domain, host, ip) {
    return this.baseUrl + '?' + querystring.stringify({
        hostname: (host && host !== "@") ? host + "." + domain : domain,
        myip: ip
    });
}

module.exports = Updater;