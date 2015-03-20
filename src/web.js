var express = require('express');

function Web() {
    this.module_inits = [];
}

Web.prototype.startup = function (bot) {
    this.bot = bot;
    this.app = express();

    this.app.locals = { fbversion : bot.version };

    // Setup core routes
    this.app.route('/').get(function (req, res) {
        res.render('index');
    });

    this.app.route('/health').get(function (req, res) {
        res.send('Now witness the firepower of this fully ARMED and OPERATIONAL bot-tlestation!');
    });

    // Call module route initializers
    for (var i in this.module_inits) {
        var spec = this.module_inits[i];
        console.log('Running', spec.name, 'web initialization');
        spec.func(this.bot, this.app);
    }

    // Set up views!
    this.app.set('views', __dirname + '/../templates');
    this.app.set('view engine', 'jade');

    // Set up static resources directory
    this.app.use('/static', express.static(__dirname + '/../static/'));

    // In case of 404, respond in the most appropriate way possible.
    this.app.use(function (req, res) {
        if (req.accepts('html')) {
            res.status(404);
            res.render('404', { url : req.url });
            return;
        }
        if (req.accepts('json')) {
            res.send({ error : 'Not found' });
            return;
        }
        res.type('txt').send('Not found');
    });

    this.app.use(require('errorhandler')());

    this.server = this.app.listen(this.bot.config.web_port, this.bot.config.web_bind_address);
    console.log('Web listening on', this.bot.config.web_bind_address + ':' + this.bot.config.web_port);

    this.bot.events.on('shutdown', this.shutdown.bind(this));
};

Web.prototype.shutdown = function () {
    this.server.close();
};

Web.prototype.addInit = function (name, func) {
    this.module_inits.push({ name : name, func : func });
};

var instance = new Web();

module.exports = instance;
