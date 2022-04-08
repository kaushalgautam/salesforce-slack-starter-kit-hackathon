const { Modal, Blocks } = require('slack-block-builder');

const getPTOSummaryString = (response) => {
    const TIME_PERIODS = {
        THIS_WEEK: 'This Week',
        NEXT_WEEK: 'Next Week',
        REST_OF_THE_MONTH: 'Rest Of The Month'
    };

    const thisWeek = moment().startOf('week').format('YYYY-MM-DD');
    const nextWeek = moment()
        .startOf('week')
        .add(7, 'days')
        .format('YYYY-MM-DD');

    // sort by weeks
    var sortedByWeek = response.reduce((res, { ProjectName, PTOEntry }) => {
        var startOfWeek = moment(PTOEntry.Start_Date__c, 'YYYY-MM-DD')
            .startOf('week')
            .format('YYYY-MM-DD');
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
            Object.defineProperty(
                sortedByWeek,
                TIME_PERIODS.THIS_WEEK,
                Object.getOwnPropertyDescriptor(sortedByWeek, key)
            );
            delete sortedByWeek[key];
        } else if (key === nextWeek) {
            Object.defineProperty(
                sortedByWeek,
                TIME_PERIODS.NEXT_WEEK,
                Object.getOwnPropertyDescriptor(sortedByWeek, key)
            );
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
    Object.keys(sortedByWeek).forEach(
        (key) => validKeys.includes(key) || delete sortedByWeek[key]
    );

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
        textString += `${time}\n`;

        /*     console.log(sortedByWeek[time]) */

        for (const project in sortedByWeek[time]) {
            textString += `  For ${project}: \n`;
            sortedByWeek[time][project].forEach((ptoEntry) => {
                textString += `    ${ptoEntry.name} from ${ptoEntry.from} to ${ptoEntry.to} \n`;
            });
        }
        textString += `___________________________________________________________\n`;
    });

    console.log(textString);
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
                // let projectWisePTOs = {};
                if (res.length > 0) {
                    // res.forEach((pto) => {
                    //     if (!projectWisePTOs[pto.ProjectName]) {
                    //         projectWisePTOs[pto.ProjectName] = [];
                    //     }
                    //     projectWisePTOs[pto.ProjectName].push({
                    //         Name: pto.PTOEntry.Owner.Name,
                    //         NumberOfDays: pto.PTOEntry.No_of_PTO_Days__c,
                    //         From: pto.PTOEntry.Start_Date__c,
                    //         To: pto.PTOEntry.End_Date__c
                    //     });
                    // });

                    // console.log(projectWisePTOs);

                    // for (const proj in projectWisePTOs) {
                    //     ptoSummaryText += `:file_folder: ${proj}: \n`;
                    //     projectWisePTOs[proj].forEach((ptoEntry) => {
                    //         ptoSummaryText += `:calendar: ${ptoEntry.Name} is on PTO for ${ptoEntry.NumberOfDays} days from ${ptoEntry.From} to ${ptoEntry.To}. \n`;
                    //     });
                    // }

                    ptoSummaryText = getPTOSummaryString(res);

                    let viewJson = Modal({ title: 'PTO Summary' })
                        .callbackId('showPTOSummary')
                        .blocks([
                            Blocks.Divider(),
                            Blocks.Section({ text: ptoSummaryText })
                        ])
                        .buildToJSON();

                    await client.views.open({
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
