var request = require('request');

module.exports = {
    displayname : 'Web Keepalive',
    description : 'Makes request to self, keeping the service alive on providers like Heroku.',

    init : function (bot) {
        bot.configLoader.ensure('keepalive_host', 'localhost:3000', 'Host string to ping self at');
        bot.configLoader.ensure('keepalive_interval', 5, 'Interval in minutes to ping self');

        var url = 'http://' + bot.config.keepalive_host + '/health';
        console.log('Keeping alive every', bot.config.keepalive_interval, 'seconds at', url);
        setInterval(function () {
                request.get(url, function () {});
            }, bot.config.keepalive_interval * 60 * 1000);
    }
};
