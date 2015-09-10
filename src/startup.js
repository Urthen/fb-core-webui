var web = require('./web');

module.exports = {
    displayname : 'Web Startup',
    description : 'Start up web server.',
    required : true,

    init : function (bot) {

        var port = process.env.PORT;
        bot.configLoader.ensure('port', port || '3000', 'Port for web server to listen on');
        bot.configLoader.ensure('web_ipfilter', 'undefined', 'IP address(es) for admin panel whitelist');
        bot.configLoader.ensure('web_theme', 'united', 'Name of bootswatch.com theme to use for Web-UI');
        bot.configLoader.ensure('web_secret', 'fritbot', 'Web session secret');
        bot.configLoader.ensure('web_host', 'localhost:3000', 'Host string of the web front-end');

        bot.events.on('modulesLoaded', function () {
            web.startup(bot);
        });
    }
};
