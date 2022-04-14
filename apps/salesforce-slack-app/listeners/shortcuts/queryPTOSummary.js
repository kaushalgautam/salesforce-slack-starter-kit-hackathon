const { Modal, Blocks } = require('slack-block-builder');
var moment = require('moment');
const { generate_pto_summary } = require('../../utils/pto-summary-generator');
const { pto_summary_error } = require('../../user-interface/modals/pto-summary-error');
const { pto_summary_empty } = require('../../user-interface/modals/pto-summary-empty');
const { pto_summary_ok } = require('../../user-interface/modals/pto-summary-ok');

const getPTOSummary = async ({ shortcut, ack, client, context }) => {
    // shortcut is getting called
    // client = use slack api
    // content = stores current session data + connection object and flag as well
    await ack();

    const conn = context.sfconnection;
    const currentuser = await conn.identity();

    await conn.apex.get('/PTOSummary/' + currentuser.user_id, function (err, res) {
        if (err) {
            return console.error(err);
        }
        try {
            let ptoSummaryText = '';
            if (JSON.parse(res.payload).length > 0) {
                ptoSummaryText = generate_pto_summary(JSON.parse(res.payload));
                client.views.open({
                    // Use the user ID associated with the shortcut
                    trigger_id: shortcut.trigger_id,
                    view: pto_summary_ok(ptoSummaryText)
                });
            } else {
                client.views.open({
                    // Use the user ID associated with the shortcut
                    trigger_id: shortcut.trigger_id,
                    view: pto_summary_empty()
                });
            }
        } catch (error) {
            client.views.open({
                // Use the user ID associated with the shortcut
                trigger_id: shortcut.trigger_id,
                view: pto_summary_error(error)
            });
            console.error(error);
        }
    });
};

module.exports = { getPTOSummary };
