'use strict';
const { Modal, Blocks } = require('slack-block-builder');

const pto_summary_empty = () => {
    return Modal({ title: 'PTO Summary' })
        .callbackId('showPTOSummary')
        .blocks([
            Blocks.Divider(),
            Blocks.Section({
                text: 'No Team Members on PTO in this month.'
            })
        ])
        .buildToJSON();
};

module.exports = { pto_summary_empty };
