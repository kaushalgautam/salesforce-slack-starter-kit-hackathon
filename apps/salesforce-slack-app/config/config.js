'use strict';

require('dotenv').config();

const requiredEnvVars = [
    'SF_CLIENT_ID',
    'SF_CLIENT_SECRET',
    'HEROKU_URL',
    'PRIVATE_KEY',
    'SF_LOGIN_URL',
    'SF_USERNAME',
    'AES_KEY',
    'HMAC_KEY',
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET'
];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`Missing ${envVar} environment variable`);
        process.exit(-1);
    }
});

const defaultSalesforceApiVersion = '54.0';

const salesforce = {
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
    herokuUrl: process.env.HEROKU_URL,
    privateKey: process.env.PRIVATE_KEY,
    loginUrl: process.env.SF_LOGIN_URL,
    username: process.env.SF_USERNAME,
    apiVersion: process.env.SF_API_VERSION || defaultSalesforceApiVersion
};

const slack = {
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    port: process.env.PORT || 3000,
    aesKey: process.env.AES_KEY

    // enable these 2 only for local dev
    // developerMode: true,
    // socketMode: true,
    // appToken: process.env.SLACK_APP_TOKEN
};

module.exports = {
    salesforce,
    slack,
    hmacKey: process.env.HMAC_KEY
};
