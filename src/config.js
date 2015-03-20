var _ = require('lodash');

function setupRoute (bot, app) {
	app.route('/config').get(function (req, res) {
		var keys = _.keys(bot.config);
		var configs = _.reduce(keys.sort(), function (accum, key) {
			var spec = {
				key : key,
				value : bot.config[key],
				description : bot.configLoader.descriptions[key]
			};

			// If the description is explicitly set to null, don't show it.
			if (spec.description !== null) {
				accum.push(spec);
			}
			return accum;
		}, []);
		res.render('config', { configs : configs });
	});
}

module.exports = {
	displayname : 'Config',
	description : 'Configuration display/edit panel',
	required : true,

	web_init : setupRoute
};