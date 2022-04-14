'use strict';
const { Modal, Blocks } = require('slack-block-builder');

const pto_summary_ok = (ptoSummaryText) => {
    return Modal({ title: 'PTO Summary' })
        .callbackId('showPTOSummary')
        .blocks([
            Blocks.Divider(),
            Blocks.Section({
                text: ptoSummaryText
            })
        ])
        .buildToJSON();
};

module.exports = { pto_summary_ok };
