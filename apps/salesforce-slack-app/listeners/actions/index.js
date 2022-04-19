'use strict';
const { appHomeViewPtoButtonCallback } = require('./app--home-view-pto-btn');
const { appHomeAuthorizeButtonCallback } = require('./app-home-authorize-btn');

module.exports.register = (app) => {
    app.action('authorize-with-salesforce', appHomeAuthorizeButtonCallback);
    app.action('view-pto', appHomeViewPtoButtonCallback);
};
