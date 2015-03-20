var config;

function setupRoute (bot, app) {
	config = bot.config;
	app.route('/config').get(function (req, res) {
		res.render('config', { config : config });
	});
}

module.exports = {
	displayname : 'Config',
	description : 'Configuration display/edit panel',
	required : true,

	web_init : setupRoute
};