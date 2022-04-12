const { Modal, Blocks } = require('slack-block-builder');
var moment = require('moment'); // require

const getPTOSummaryString = (response) => {
    const TIME_PERIODS = {
        THIS_WEEK: 'This Week',
        NEXT_WEEK: 'Next Week',
        REST_OF_THE_MONTH: 'Rest Of The Month'
    };

    const thisWeek = moment().startOf('week').format('YYYY-MM-DD');
    const nextWeek = moment().startOf('week').add(7, 'days').format('YYYY-MM-DD');

    // sort by weeks
    var sortedByWeek = response.reduce((res, { ProjectName, PTOEntry }) => {
        var startOfWeek = moment(PTOEntry.Start_Date__c, 'YYYY-MM-DD').startOf('week').format('YYYY-MM-DD');
        res[startOfWeek] = res[startOfWeek] || [];
        res[startOfWeek].push({
            project: ProjectName,
            name: PTOEntry.Owner.Name,
            from: PTOEntry.Start_Date__c,
            to: PTOEntry.End_Date__c,
            days: PTOEntry.No_of_PTO_Days__c
        });
        return res;
    }, {});

    // give time periods human readable names
    for (const key in sortedByWeek) {
        if (key === thisWeek) {
            Object.defineProperty(sortedByWeek, TIME_PERIODS.THIS_WEEK, Object.getOwnPropertyDescriptor(sortedByWeek, key));
            delete sortedByWeek[key];
        } else if (key === nextWeek) {
            Object.defineProperty(sortedByWeek, TIME_PERIODS.NEXT_WEEK, Object.getOwnPropertyDescriptor(sortedByWeek, key));
            delete sortedByWeek[key];
        } else {
            if (!(TIME_PERIODS.REST_OF_THE_MONTH in sortedByWeek)) {
                sortedByWeek[TIME_PERIODS.REST_OF_THE_MONTH] = [];
            }
            sortedByWeek[key].forEach((item) => {
                sortedByWeek[TIME_PERIODS.REST_OF_THE_MONTH].push(item);
            });
        }
    }
    validKeys = Object.values(TIME_PERIODS);
    Object.keys(sortedByWeek).forEach((key) => validKeys.includes(key) || delete sortedByWeek[key]);

    // group by projects inside each time interval
    const groupByKey = (list, key) =>
        list.reduce(
            (hash, obj) => ({
                ...hash,
                [obj[key]]: (hash[obj[key]] || []).concat(obj)
            }),
            {}
        );
    for (const key in sortedByWeek) {
        sortedByWeek[key] = groupByKey(sortedByWeek[key], 'project');
    }

    // create string to be shown to user
    textString = '';
    Object.values(TIME_PERIODS).forEach((time) => {
        if (!time in sortedByWeek) return;
        switch (time) {
            case TIME_PERIODS.THIS_WEEK:
            case TIME_PERIODS.NEXT_WEEK:
                textString += `\n:calendar: *${time}*\n`;
                for (const project in sortedByWeek[time]) {
                    textString += `\n• For ${project} \n`;
                    sortedByWeek[time][project].forEach((ptoEntry) => {
                        textString += `-> ${ptoEntry.name} from ${new moment(ptoEntry.from).format('dddd')} for ${ptoEntry.days} day(s) \n`;
                    });
                }
                break;
            case TIME_PERIODS.REST_OF_THE_MONTH:
                textString += `\n:calendar: *${time}*\n`;
                for (const project in sortedByWeek[time]) {
                    textString += `\n• For ${project} \n`;
                    sortedByWeek[time][project].forEach((ptoEntry) => {
                        textString += `-> ${ptoEntry.name} from ${new moment(ptoEntry.from).format('Do MMM')} for ${ptoEntry.days} day(s) \n`;
                    });
                }
                break;
        }
        textString += `\n`;
    });

    console.log(textString);

    return textString;
};

const getPTOSummary = async ({ shortcut, ack, client, context }) => {
    // shortcut is getting called
    // client = use slack api
    // content = stores current session data + connection object and flag as well
    await ack();
    console.log(shortcut);
    console.log('-----------------------------------------------');
    const conn = context.sfconnection;
    const currentuser = await conn.identity();

    await conn.apex.get('/PTOSummary/' + currentuser.user_id, function (err, res) {
        if (err) {
            return console.error(err);
        }
        try {
            console.log('response: \n\n\n');
            console.log(res);
            console.log('\n\n\n');

            let ptoSummaryText = '';
            // let projectWisePTOs = {};
            if (JSON.parse(res.payload).length > 0) {
                ptoSummaryText = getPTOSummaryString(JSON.parse(res.payload));

                let viewJson = Modal({ title: 'PTO Summary' })
                    .callbackId('showPTOSummary')
                    .blocks([Blocks.Divider(), Blocks.Section({ text: ptoSummaryText })])
                    .buildToJSON();

                client.views.open({
                    // Use the user ID associated with the shortcut
                    trigger_id: shortcut.trigger_id,
                    view: viewJson
                });
            } else {
                let viewJson = Modal({ title: 'PTO Summary' })
                    .callbackId('showPTOSummary')
                    .blocks([
                        Blocks.Divider(),
                        Blocks.Section({
                            text: 'No Team Members on PTO in this month.'
                        })
                    ])
                    .buildToJSON();

                client.views.open({
                    // Use the user ID associated with the shortcut
                    trigger_id: shortcut.trigger_id,
                    view: viewJson
                });
            }
        } catch (error) {
            let viewJson = Modal({ title: 'PTO Summary' })
                .callbackId('showPTOSummary')
                .blocks([
                    Blocks.Divider(),
                    Blocks.Section({
                        text: 'Something went Wrong \n' + JSON.stringify(error)
                    })
                ])
                .buildToJSON();

            client.views.open({
                // Use the user ID associated with the shortcut
                trigger_id: shortcut.trigger_id,
                view: viewJson
            });
            console.error(error);
        }
    });
};

module.exports = { getPTOSummary };
