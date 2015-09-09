var crypto = require('crypto');

var keys = {};

function setupRoute (web) {
	web.app.get('/users', function (req, res) {
		res.render('users', { users : web.bot.users.users });
	});

	web.app.get('/users/auth', function (req, res) {
		var userid = keys[req.query.key];

		// Log user in if valid token id
		if (userid) {
			web.bot.db.schemas.user.findById(userid).execQ().then(function (user) {
				req.session.user = user;
				res.redirect('/');
			}, function (err) {
				console.log('error fetching user:', err);
				web.error(res, 'Error retrieving user', 'Try asking the bot to log in again.');
			});
		} else {
			// I misspelled it the first time but am leaving it because it's funnier this way.
			web.error(res, 'Unvalid login token', 'Try asking the bot to log in again.');
		}
	});

	web.app.get('/users/logout', function (req, res) {
		req.session.destroy(function () {
			res.redirect('/');
		});
	});
}

function webAuthLink (route) {
	var bot = this;
	var authkey = crypto.randomBytes(12).toString('hex');
	var login_url = 'http://' + bot.config.web_host + '/users/auth?key=' + authkey;
	keys[authkey] = route.user.id;
	route.direct().send('?login_link', login_url);
}

module.exports = {
	displayname : 'User Authentication',
	description : 'Logs chat users into the web UI',
	required : true,

	web_init : setupRoute,

	commands : [{
        name : 'Web Authentication',
        description : 'Logs you into the web UI',
        usage : 'login',
        trigger : /login/i,
        func : webAuthLink
    }]
};