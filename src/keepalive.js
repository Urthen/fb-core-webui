var request = require('request');

module.exports = {
    displayname : 'Web Keepalive',
    description : 'Makes request to self, keeping the service alive on providers like Heroku.',

    init : function (bot) {
        bot.configLoader.ensure('keepalive_interval', 15, 'Interval in minutes to ping self');
        bot.configLoader.ensure('keepalive_sleep', '', 'Time to begin sleep (Heroku needs 6+ hours idle time)');
        bot.configLoader.ensure('keepalive_wake', '', 'Time to wake up');

        var url = 'http://' + bot.config.web_host + '/health';
        var insomnia = true;

        console.log('Keeping alive every', bot.config.keepalive_interval, 'minutes at', url);

        if (bot.config.keepalive_sleep !== '' && bot.config.keepalive_wake !== '') {
            console.log('Sleep period active between', bot.config.keepalive_sleep, 'and', bot.config.keepalive_wake)
            insomnia = false;
            var sleepTimeS = bot.config.keepalive_sleep.split(':');
            var sleepTime = sleepTimeS[0] * 60 + sleepTimeS[1] * 1;
            var wakeTimeS = bot.config.keepalive_wake.split(':');
            var wakeTime = wakeTimeS[0] * 60 + wakeTimeS[1] * 1;
        }

        setInterval(function () {
                var now = new Date();
                var nowTime = now.getHours() * 60 + now.getMinutes();
                var awake = true;

                if (    !insomnia && // If we aren't permanently awake and
                        ((nowTime >= sleepTime && nowTime < wakeTime && sleepTime < wakeTime) || // it's after sleep time, but before wake time, or
                        (nowTime >= sleepTime && sleepTime > wakeTime)) //it is after sleep time and wake time is tomorrow
                    ) {
                    awake = false
                }

                if (awake) {
                    request.get(url, function () {});
                } else {
                    console.log("Skipped keepalive due to sleep interval.");
                }
            }, bot.config.keepalive_interval * 60 * 1000);
    }
};
