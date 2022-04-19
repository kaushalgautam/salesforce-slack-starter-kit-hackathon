'use strict';
const { myPTOsScreen } = require('../user-interface/app-home');
const { queryUserPtos } = require('../salesforce/query/user-ptos');

const myPTOList = async (context, client, slackUserId) => {
    const conn = context.sfconnection;
    const currentuser = await conn.identity();

    // Query for travel requests
    const ptos = await queryUserPtos(conn);
    console.log('ptos: ');
    console.log(ptos);

    await client.views.publish({
        // Use the user ID associated with the event
        user_id: slackUserId,
        view: myPTOsScreen(ptos, currentuser.display_name, conn.instanceUrl)
    });
};

module.exports = { myPTOList };
