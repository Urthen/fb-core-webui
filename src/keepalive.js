var web = require('./web');
var request = require('request');

module.exports = {
    displayname : 'Web Keepalive',
    description : 'Makes request to self, keeping the service alive on providers like Heroku.',

    init : function (bot) {
    	if (bot.config.keepalive) {
            var url = 'http://' + bot.config.keepalive.host + '/health';
            console.log('Keeping alive every', bot.config.keepalive.interval, 'seconds at', url);
            setInterval(function () {
                    request.get(url, function () {});
                }, bot.config.keepalive.interval * 1000);
        }
    }
}