var web = require('./web');

module.exports = {
    displayname : 'Web Startup',
    description : 'Start up web server.',
    required : true,

    init : function (bot) {

        // Heroku needs special attention
        var port = process.env.PORT;
        bot.configLoader.ensure('port', port || '3000', 'Port for web server to listen on');

        // Set up ip whitelisting filter; pass 'undefined' if it's not there
        // TODO: rip this out when webui user accounts are added
        bot.configLoader.ensure('web_ipfilter', 'undefined', 'IP address(es) for admin panel whitelist');

        // Set theme for web ui
        bot.configLoader.ensure('web_theme', 'united', 'Name of bootswatch.com theme to use for Web-UI');

        bot.events.on('modulesLoaded', function () {
            web.startup(bot);
        });
    }
};
