'use strict';

const queryUserPtos = async (connection) => {
    try {
        //Get the UserId
        const currentuser = await connection.identity();

        // Query for travel requests
        const result = await connection.query(
            `SELECT Id, Name, OwnerId, No_of_PTO_Days__c, Start_Date__c, End_Date__c, Status__c FROM PTO_Entries__c WHERE OwnerId = \'${currentuser.user_id}\' ORDER BY Start_Date__c`
        );
        return result;
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = { queryUserPtos };
