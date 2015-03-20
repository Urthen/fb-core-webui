var express = require('express');
var _ = require('lodash');

function Web() {
    this.module_inits = [];
    this.module_pages = [];
}

Web.prototype.startup = function (bot) {
    this.bot = bot;
    this.bot.web = this;
    this.app = express();

    // Don't require other modules to require express.
    this.express = express;

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
        spec.func(this);
    }

    this.app.locals = { fbversion : bot.version, module_pages : _.sortBy(this.module_pages, 'name') };

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

    this.server = this.app.listen(this.bot.config.port);
    console.log('Web listening on port', this.bot.config.port);

    this.bot.events.on('shutdown', this.shutdown.bind(this));
};

Web.prototype.shutdown = function () {
    this.server.close();
};

Web.prototype.addInit = function (name, func) {
    this.module_inits.push({ name : name, func : func });
};

Web.prototype.addModuleApp = function (route, subapp, name) {
    route = '/modules' + route;
    if (name) {
        this.module_pages.push({ name : name, url : route });
    }

    console.log(route, subapp);

    this.app.use(route, subapp, function (req, res) {
        res.render('module_page', { module_render : res.module_render });
    });
};

var instance = new Web();

module.exports = instance;
