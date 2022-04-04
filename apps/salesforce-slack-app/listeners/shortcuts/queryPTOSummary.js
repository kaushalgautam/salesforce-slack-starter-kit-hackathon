const { Modal, Blocks } = require('slack-block-builder');

const getPTOSummary = async ({ shortcut, ack, client, context }) => {
    // shortcut is getting called
    // client = use slack api
    // content = stores current session data + connection object and flag as well
    await ack();
    console.log(shortcut);
    console.log('-----------------------------------------------');
    const conn = context.sfconnection;
    const currentuser = await conn.identity();

    await conn.apex.get(
        '/PTOSummary/' + currentuser.user_id,
        function (err, res) {
            if (err) {
                return console.error(err);
            }
            try {
                console.log(res);
                console.log(res.length);
                let ptoSummaryText = '';
                let projectWisePTOs = {};
                if (res.length > 0) {
                    res.forEach((pto) => {
                        if (!projectWisePTOs[pto.ProjectName]) {
                            projectWisePTOs[pto.ProjectName] = [];
                        }
                        projectWisePTOs[pto.ProjectName].push({
                            Name: pto.PTOEntry.Owner.Name,
                            NumberOfDays: pto.PTOEntry.No_of_PTO_Days__c,
                            From: pto.PTOEntry.Start_Date__c,
                            To: pto.PTOEntry.End_Date__c
                        });
                    });

                    console.log(projectWisePTOs);

                    for (const proj in projectWisePTOs) {
                        ptoSummaryText += `:file_folder: ${proj}: \n`;
                        projectWisePTOs[proj].forEach((ptoEntry) => {
                            ptoSummaryText += `:calendar: ${ptoEntry.Name} is on PTO for ${ptoEntry.NumberOfDays} days from ${ptoEntry.From} to ${ptoEntry.To}. \n`;
                        });
                    }

                    let viewJson = Modal({ title: 'PTO Summary' })
                        .callbackId('showPTOSummary')
                        .blocks(
                            Blocks.Section({
                                text: "Hey there! Here's a summary of your teammates' PTOs "
                            })
                        )
                        .blocks([
                            Blocks.Divider(),
                            Blocks.Section({ text: ptoSummaryText })
                        ])
                        .buildToJSON();

                    client.views.open({
                        // Use the user ID associated with the shortcut
                        trigger_id: shortcut.trigger_id,
                        view: viewJson
                    });
                } else {
                    console.log('something went wrong');
                    console.log('res');
                    console.log(res);
                }
            } catch (error) {
                console.error(error);
            }
        }
    );
};

module.exports = { getPTOSummary };
