module.exports = {
    displayname : 'Core Web UI',
    description : 'Core front-end functionality.',
    children : [
        require('./src/startup'),
        require('./src/keepalive'),
        require('./src/commands'),
        require('./src/config'),
        require('./src/modules')
    ] };
