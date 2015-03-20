var _ = require('lodash');

function setupRoute (web) {
	web.app.route('/config').get(function (req, res) {
		var keys = _.keys(web.bot.config);
		var configs = _.reduce(keys.sort(), function (accum, key) {
			var spec = {
				key : key,
				value : web.bot.config[key],
				description : web.bot.configLoader.descriptions[key]
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