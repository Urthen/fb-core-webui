var web = require('./web');

var modules = [];

function addModule (module) {
	// If this is a top-level module, store it.
	if (!module.parent) {
		if (module.author && !module.author.name) {
			module.author = {
				name : module.author
			};
		}
		modules.push(module);
	}

	// Pass module to web if it needs to be initialized
	// Mostly just saves a small amount code duplication.
	if (module.web_init) {
		web.addInit(module.name, module.web_init);
	}
}

function setupRoute (web) {
	web.app.route('/modules').get(function (req, res) {
		res.render('modules', { modules : modules });
	});
}

function initModules(bot, modules) {
	// Add all previously loaded modules
	for (var i = 0; i < modules.loaded.length; i++) {
		addModule(modules.loaded[i]);
	}

	// Add all future modules
	bot.events.on('moduleLoaded', addModule);
}

module.exports = {
	displayname : 'Module Loading',
	description : 'Web Module Listing.',
	required : true,

	init : initModules,
	web_init : setupRoute
};