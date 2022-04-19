'use strict';

const { HomeTab, Blocks, Elements, Md } = require('slack-block-builder');

const myPTOsScreen = (ptos, username, instanceUrl) => {
    const homeTab = HomeTab();
    // _addButtonsToHomeTab(homeTab);

    headerText = `${Md.bold('All PTOs for ' + username)}`;
    homeTab.blocks(
        Blocks.Section({
            text: headerText
        }),
        // Blocks.Header({
        //     text: `All PTOs for ${ username }`
        // }),
        Blocks.Divider()
    );

    if (ptos.totalSize === 0) {
        homeTab.blocks(
            Blocks.Section({
                text: 'No upcoming PTOs for you.'
            })
        );
    }

    ptos.records.forEach((pto, ptoIndex) => {
        if (ptoIndex > 0) {
            homeTab.blocks(Blocks.Divider());
        }
        let ptoText = `${Md.emoji('surfer')} ${Md.bold('For: ')} ${pto.No_of_PTO_Days__c} day(s) \n\n`;
        const startDate = new Date(pto.Start_Date__c).toLocaleDateString('en-US');
        const endDate = new Date(pto.End_Date__c).toLocaleDateString('en-US');
        ptoText += `${Md.emoji('calendar')} ${Md.bold('From-To:')} ${startDate} - ${endDate} \n\n`;
        ptoText += `${Md.emoji('eyes')} ${Md.bold('Status:')} ${pto.Status__c} ${Md.emoji(getEmoji(pto.Status__c))} \n\n\n`;
        homeTab.blocks(
            Blocks.Section({
                text: ptoText
            }).accessory(
                Elements.Button({
                    actionId: 'view-pto',
                    text: 'View Details',
                    url: `${instanceUrl} /${pto.Id}`
                })
            )
        );
    });

    // const createNewPTOButton = Elements.Button({
    //     actionId: 'create-pto',
    //     text: 'Create New PTO'
    // });
    homeTab.blocks(Blocks.Divider());
    // homeTab.blocks(Blocks.Actions().elements(createNewPTOButton));

    return homeTab.buildToJSON();
};

// const _addButtonsToHomeTab = (homeTab) => {
//     const firstButton = Elements.Button({
//         actionId: 'view-my-travel-requests',
//         text: 'My Travel Requests'
//     });
//     const secondButton = Elements.Button({
//         actionId: 'view-travel-requests-to-review',
//         text: 'Travel Requests To Review'
//     });

//     homeTab.blocks(Blocks.Actions().elements(firstButton, secondButton));
//     return homeTab;
// };

const getEmoji = (status) => {
    switch (status) {
        case 'Approved':
            return 'white_check_mark';
        case 'Draft':
            return 'pencil';
        case 'Submitted':
            return 'ledger';
        case 'Rejected':
            return 'x';
        default:
            return 'grey_question';
    }
};

module.exports = {
    myPTOsScreen
};
