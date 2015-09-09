var _ = require('lodash');

function setupRoute (web) {
	web.app.route('/config').get(function (req, res) {
		if (req.session && req.session.user && req.session.user.admin) {
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
		} else {
			web.error(res, 'Unauthorized', 'Bad user, no cookie.');
		}
	});
}

module.exports = {
	displayname : 'Config',
	description : 'Configuration display/edit panel',
	required : true,

	web_init : setupRoute
};