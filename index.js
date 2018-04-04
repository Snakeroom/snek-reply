const package = require('./package.json');
const config = require('./config.json');

const Snooper = require('reddit-snooper');
const snooper = new Snooper(Object.assign(config, {
    user_agent: `${config.platform}:${config.app_id}:${package.version} (By ${config.owner}) https://github.com/Snektective/snek-reply`,
}));

const watcher = snooper.watcher.getCommentWatcher('test');

watcher
    .on('comment', (comment) => {
        const text = comment.data.body.replace(/ /g, '').replace(/\n/g, '').toLowerCase();
        const match = text.includes(config.trigger.toLowerCase());

        console.log(text, 'is', match);
        if (match) {
            snooper.api.post('/api/comment', {
                api_type: 'json',
                text: config.reply_message,
                thing_id: comment.data.name,
            }, (err, statusCode, data) => {
                if (!err) console.log('just replied to comment: ' + comment.data.name)
            })
        }
    })
    .on('error', console.error)

process.on('SIGINT', () => {
    console.log('Goodbye!');
    watcher.close();
    process.exit();
});
