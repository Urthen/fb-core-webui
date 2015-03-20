var web = require('./web');

module.exports = {
    displayname : 'Web Startup',
    description : 'Start up web server.',
    required : true,

    init : function (bot) {
        bot.configLoader.ensure('web_bind_address', 'localhost', 'Address to bind to');
        bot.configLoader.ensure('web_port', '3000', 'Port to bind to');

        bot.events.on('modulesLoaded', function () {
            web.startup(bot);
        });
    }
};
