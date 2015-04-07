var request = require('request');

module.exports = {
    displayname : 'Web Keepalive',
    description : 'Makes request to self, keeping the service alive on providers like Heroku.',

    init : function (bot) {
        bot.configLoader.ensure('web_host', 'localhost:3000', 'Host string of the web front-end');
        bot.configLoader.ensure('keepalive_interval', 15, 'Interval in minutes to ping self');

        var url = 'http://' + bot.config.web_host + '/health';
        console.log('Keeping alive every', bot.config.keepalive_interval, 'minutes at', url);
        setInterval(function () {
                request.get(url, function () {});
            }, bot.config.keepalive_interval * 60 * 1000);
    }
};
