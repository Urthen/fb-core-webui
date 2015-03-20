var modules = [];

function addModule (module) {

	// This modules doesn't care about modules without commands
	if (!module.commands || module.commands.length === 0) {
		return;
	}

	var entry = {
		name : module.displayname,
		description : module.description,
		commands : []
	};

	var command;
	for (var i = 0; i < module.commands.length; i++) {
		command = module.commands[i];
		entry.commands.push({
			name : command.name,
			description : command.description,
			usage : command.usage,
			trigger : command.trigger
		});
	}

	modules.push(entry);
}

function setupRoute (bot, app) {
	app.route('/commands').get(function (req, res) {
		res.render('commands', { modules : modules });
	});
}

function initHelp(bot, modules) {
	// Add all previously loaded modules
	for (var i = 0; i < modules.loaded.length; i++) {
		addModule(modules.loaded[i]);
	}

	// Add all future modules
	bot.events.on('moduleLoaded', addModule);
}

module.exports = {
	displayname : 'Help',
	description : 'Web command manual',
	required : true,

	init : initHelp,
	web_init : setupRoute
};