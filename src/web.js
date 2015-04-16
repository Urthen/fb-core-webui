var express = require('express');
var ipfilter = require('express-ipfilter');
var _ = require('lodash');

function notFoundHandler(req, res) {
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
}

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

    // Restrict access to the webui via IP for now, and only if an actual IP or range was provided
    // TODO: rip this out when webui user accounts are added
    if (bot.config.web_ip_filter !== "undefined")
        this.app.use(ipfilter(bot.config.web_ip_filter, {mode: 'allow'}));

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
    this.app.use(notFoundHandler);

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

    // Render pages if the prior middleware passes it here.
    // It is perfectly valid for the subapp to render the page and not call next().
    this.app.use(route, subapp, function (req, res) {
        if (!res.module_render) {
            notFoundHandler(req, res);
            return;
        }
        res.render('module_page', { module_render : res.module_render });
    });
};

Web.prototype.render = function (app, template, func) {
    if (!func) { func = function (req, next) { next({}); }; }

    return function (req, res, next) {
        func(req, function (data) {
            app.render(template, data, function (err, html) {
                if (err) {
                    next(err);
                } else {
                    res.module_render = html;
                    next();
                }
            });
        });
    };
};

var instance = new Web();

module.exports = instance;
