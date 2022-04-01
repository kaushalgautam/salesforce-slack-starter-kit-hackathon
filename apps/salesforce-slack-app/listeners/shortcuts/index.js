'use strict';

const { whoamiCallback } = require('./whoami');

module.exports.register = (app) => {
    console.log('yo');
    app.shortcut('who_am_i', whoamiCallback);
};
