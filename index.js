module.exports = {
    displayname : 'Core Web UI',
    description : 'Core front-end functionality.',
    children : [
        require('./src/startup'),
        require('./src/keepalive')
    ] };