var web = require('./web');

module.exports = {
    displayname : 'Web Startup',
    description : 'Start up web server.',

    init : function (bot) {
    	web.startup(bot);
    }
}