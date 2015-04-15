var web = require('./web');

module.exports = {
    displayname : 'Web Startup',
    description : 'Start up web server.',
    required : true,

    init : function (bot) {

        // Heroku needs special attention
        var port = process.env.PORT;
        bot.configLoader.ensure('port', port || '3000', 'Port for web server to listen on');

        bot.events.on('modulesLoaded', function () {
            web.startup(bot);
        });
    }
};
