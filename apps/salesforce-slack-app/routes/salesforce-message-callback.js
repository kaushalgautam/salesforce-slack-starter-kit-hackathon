'use strict';
const CryptoJS = require('crypto-js');
const persistedClient = require('../store/bolt-web-client');
const { Md, Message } = require('slack-block-builder');
const config = require('../config/config');

const salesforceMessageHandler = async (req, res) => {
    // Note:if using HTTPReceiver instead of ExpressReceiver, compute the body with raw-body as follows:
    // const rawBody = await getRawBody(req);
    // const body = JSON.parse(rawBody.toString());

    // Get Salesforce signature
    const signature = req.headers['x-salesforce-signature'];

    // Check HMAC 256 signature
    // Note: if fields sent in body have decimal digits,
    // the JSON parsing from Apex and Node differs and this may fail
    console.log(JSON.stringify(req.body));
    console.log(config.hmacKey);
    const hmac = CryptoJS.HmacSHA256(JSON.stringify(req.body), config.hmacKey);
    const hmacBase64 = CryptoJS.enc.Base64.stringify(hmac);

    if (signature !== hmacBase64) {
        console.error('Suspicious callout origin');
        // Respond with error
        res.writeHead(403);
        res.end('Wrong Salesforce signature', 'utf-8');
        return;
    }

    console.log(JSON.stringify(req.body));

    if (req.body.type === 'notification_immediatePto') {
        let body = req.body.payload;
        req.body.forEach((item) => {
            _postMessage(
                item.userId,
                `${Md.emoji('palm_tree')} Your teammate ${item.pto.OwnerName} on project <${item.instanceUrl}/${item.pm.Project__r.Id}|${
                    item.pm.Project__r.Name
                }> is OOO from ${item.pto.Start_Date} for ${item.pto.No_of_PTO_Days} day(s).`
            );
        });
    } else {
        console.log('different type: ');
        console.log(req);
    }

    // Send success message
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Message received successfully');
};

const _postMessage = async (userId, message) => {
    const msg = Message({ channel: userId, text: message });
    await persistedClient.client.chat.postMessage(msg.buildToObject());
};

const salesforceMessageCallback = {
    path: '/salesforce/message',
    method: ['POST'],
    handler: salesforceMessageHandler
};

module.exports = { salesforceMessageCallback };
