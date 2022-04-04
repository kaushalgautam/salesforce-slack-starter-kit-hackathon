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
    console.log('-----------------------------------------------');

    const conn = context.sfconnection;
    const currentuser = await conn.identity();
    console.log('currentuser');
    console.log(currentuser);
    console.log('-----------------------------------------------');
    console.log('userid');
    console.log(currentuser.user_id);
    console.log('-----------------------------------------------');

    await conn.apex.get(
        '/PTOSummary/' + currentuser.user_id,
        function (err, res) {
            if (err) {
                return console.error(err);
            }
            console.log('response: ', res);
            // the response object structure depends on the definition of apex class
        }
    );
};

module.exports = { getPTOSummary };
