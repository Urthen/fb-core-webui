var web = require('./web');

module.exports = {
    displayname : 'Web Startup',
    description : 'Start up web server.',
    required : true,

    init : function (bot) {
    	bot.events.on('modulesLoaded', function () {
    		web.startup(bot);
    	});
    }
}