const getPTOSummary = async ({ shortcut, ack, client, context }) => {
    // shortcut is getting called
    // client = use slack api
    // content = stores current session data + connection object and flag as well
    ack();
    console.log(client);
    console.log('-----------------------------------------------');
    console.log(shortcut);
    console.log('-----------------------------------------------');
    console.log(context);
};

module.exports = { getPTOSummary };
