'use strict';

const { getPTOSummary } = require('./queryPTOSummary');
const { whoamiCallback } = require('./whoami');

module.exports.register = (app) => {
    app.shortcut('who_am_i', whoamiCallback);
    app.shortcut('get_pto_summary', getPTOSummary);
};
