'use strict';
const { Modal, Blocks } = require('slack-block-builder');

const pto_summary_error = (error) => {
    return Modal({ title: 'PTO Summary' })
        .callbackId('showPTOSummary')
        .blocks([
            Blocks.Divider(),
            Blocks.Section({
                text: 'Something went wrong \n' + JSON.stringify(error)
            })
        ])
        .buildToJSON();
};

module.exports = { pto_summary_error };
