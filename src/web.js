var express = require('express');
var ipfilter = require('express-ipfilter');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var _ = require('lodash');

function notFoundHandler(req, res) {
    res.status(404);
    if (req.accepts('html')) {
        res.render('error', { title : "404'ed!", text : "Don't press that button." });
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
    console.log('Setting up web interface...');
    this.bot = bot;
    this.bot.web = this;
    this.app = express();

    // Don't require other modules to require express.
    this.express = express;

    // Restrict access to the webui via IP for now, and only if an actual IP or range was provided
    // TODO: rip this out when webui user accounts are added
    if (bot.config.web_ipfilter !== undefined && bot.config.web_ipfilter !== 'undefined') {
        this.app.use(ipfilter(bot.config.web_ipfilter, { mode : 'allow' }));
    }

    // Setup user sessions
    this.app.use(session({
        secret : bot.config.web_secret,
        store : new MongoStore({ mongooseConnection : bot.db.db }),
        resave : false,
        saveUninitialized : false
    }));

    // Set up locals for templating
    // These locals are only available in core webui templates - not modules
    this.app.locals = {
        fbname : bot.config.name,
        fbversion : bot.version,
        theme : bot.config.web_theme
    };

    // Locals set here are made available (Via magic in the web.render function) to modules.
    this.app.use(function (req, res, next) {
        res.locals.user = req.session.user;
        next();
    });

    // Set up views!
    this.app.set('views', __dirname + '/../templates');
    this.app.set('view engine', 'jade');

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

    // Add module pages to locals
    this.app.locals.module_pages = _.sortBy(this.module_pages, 'name');

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
    // If the subapp calls next but does not provide module_render (rendered HTML) on the response,
    // generate a 404 page.
    this.app.use(route, subapp, function (req, res) {
        if (!res.module_render) {
            notFoundHandler(req, res);
            return;
        }
        res.render('module_page', { module_render : res.module_render });
    });
};

// Render the given template. Eliminates a lot of boilerplate for modules.
Web.prototype.render = function (app, template, func) {
    if (!func) { func = function (req, next) { next({}); }; }

    return function (req, res, next) {
        func(req, function (data) {

            // Since we're in two separate apps, add the response locals here so the module app render can access it.
            _.defaults(data, res.locals);

            // Use the module's app to render the template.
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

// Generate an error response and send it immediately.
Web.prototype.error = function (res, title, text) {
    res.status(400);
    // Need to pass in user, as it is hidden in the response rather than current app locals.
    this.app.render('error', { title : title, text : text, user : res.locals.user }, function (err, html) {
        if (err) {
            console.log(err);
            res.send("I error'ed while expressing my errors. I'm really a horrid bot.");
        } else {
            res.send(html);
        }
    });
};

var instance = new Web();

module.exports = instance;
