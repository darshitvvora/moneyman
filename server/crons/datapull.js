#!/usr/bin/env node
const debug = require('debug');
const program = require('commander');
const moment = require('moment');
const bluebird = require('bluebird');
const _ = require('lodash');
const rp = require('request-promise');
const config = require('../config/environment');
const logger = require('../components/logger');
const {
    GRONIT_URL, HOURLY_MAIL_GRONIT_ID, CC_EMAIL, BCC_EMAIL,
    SMTP_USER, URLS_VERIFY, CRON_TOKEN, REPLY_TO,
} = config;
const {
    sequelizeVerify, Sequelize, User, Client, bdQuery, State, ClientCategory,
} = require('../conn/sqldb');

const log = (...args) => {
    logger.debug(...args);
    debug('cron:clientVerify: HourlyMail')(...args);
};

module.exports = class HourlyMail {
    constructor() {
        this.init();
        this.startDate = moment()
            .subtract(this.time, 'h')
            .format('YYYY-MM-DD HH:mm:ss');
        this.endDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    init() {
        this.program = program;

        program
            .version('1.0.0')
            .option('-q, --query <d>', 'bd-query id')
            .option('-t, --time <d>', 'enter hours')
            .parse(process.argv);

        this.queryId = +this.program.query || 1;
        this.time = +this.program.time || 1;
    }

    async main() {
        try {
            const allCases = await this.getCases();

            if(!allCases.length) {
                log('No record found');
                return rp.get(`${GRONIT_URL}/run/${HOURLY_MAIL_GRONIT_ID}`);
            }

            const [state, category] = await Promise.all([
                State.findAll({
                    attributes: ['id', 'name'],
                }),
                ClientCategory.findAll({
                    attributes: ['id', 'name'],
                }),
            ]);

            let data = [];

            if(this.queryId === 2) {
                const vendorAdminUserList = await User.findAll({
                    attributes: ['id', 'client_id'],
                    where: {
                        type: USER.ADMIN,
                        client_id: allCases.map(x => x.created_by),
                    },
                    raw: true,
                });

                allCases.forEach(x => {
                    const clients = vendorAdminUserList.filter(v => v.client_id === +x.created_by);

                    clients.map(user => data.push({
                        ...x,
                        created_by: user.id,
                    }));
                });
            } else {
                data = allCases;
            }

            this.userApplicant = _.groupBy(data, 'created_by');
            this.stateAlias = state.reduce((acc, { id, name }) => Object.assign(acc, { [id]: name }), {});
            this.clientCategory = category
                .reduce((acc, { id, name }) => Object.assign(acc, { [id]: name }), {});
            this.clientCategoryList = Object.assign({}, ...Object.keys(this.userApplicant).map(x => ({
                [x]: _.groupBy(this.userApplicant[x], 'client_category_id'),
            })));

            const userIdList = Object.keys(this.userApplicant).filter(x => +x)
                .map(Number);

            const users = await User.findAll({
                attributes: ['id', 'email', 'name', 'client_id'],
                where: { id: userIdList },
                include: [{
                    model: Client,
                    attributes: ['name'],
                    include: [{
                        model: User,
                        as: 'Admins',
                        attributes: ['email'],
                        required: false,
                    }],
                }],
            });

            this.userEmailMap = users.reduce((acc, user) =>
                Object.assign(acc, {
                    [user.id]: {
                        id: user.id,
                        clientName: user.Client.name,
                        client_id: user.client_id,
                        emailId: user.email,
                        name: user.name,
                        admins: (user.Client.Admins || []).map(adm => adm.email),
                    },
                })
            , {});

            const emailData = userIdList.map(userId =>
                this.setTemplateData(this.userEmailMap[userId], userId)
            );

            log('Sending mails');
            await bluebird.map(emailData, record => HourlyMail
                .sendMail(this.userEmailMap[record.userId], record));

            log('Hourly mail completed successfully');
        } catch(err) {
            await Notify.slack(`Hourly Mail failed: ${err.stack}`);
            logger.error('Hourly mail failed: ', err);
        } finally {
            if(config.NODE_ENV !== 'development') {
                await rp.get(`${GRONIT_URL}/complete/${HOURLY_MAIL_GRONIT_ID}`);
            }
        }

        return true;
    }

    setTemplateData(user, clientUsers) {
        const data = this.clientCategoryList[clientUsers];
        return {
            todayDate: moment().format('DD-MMM-YYYY'),
            userId: user.id,
            dashboardLink: `${URLS_VERIFY}/main/dashboard`,
            userName: user.name,
            userList: Object.keys(data).map(categoryId => ({
                name: this.clientCategory[categoryId],
                applicants: data[categoryId].map((v) => {
                    try {
                        return {
                            name: v.full_name,
                            state: this.stateAlias[v.state_id],
                            comment: v.comments,
                            link: `${URLS_VERIFY}/main/cases/${v.id}/view`,
                        };
                    } catch(err) {
                        err.message += ` details:: caseId = ${v.id}`;
                        throw err;
                    }
                }),
            })),
        };
    }

    getCases() {
        return bdQuery.findByPk(this.queryId)
            .then((re) => {
                const querySQL = re.query
                    .replace(/{{start_date}}/g, this.startDate)
                    .replace(/{{end_date}}/g, this.endDate);

                return sequelizeVerify
                    .query(querySQL, { type: Sequelize.QueryTypes.SELECT })
                    .then(resultSet => resultSet);
            });
    }

    static async sendMail(user, templateData) {
        try {
            let ccAddresses = CC_EMAIL ? [CC_EMAIL] : [];
            ccAddresses = ccAddresses.concat(user.admins);

            await rp({
                method: 'POST',
                uri: `${URLS_VERIFY}/api/email?token=${CRON_TOKEN}`,
                json: true,
                body: {
                    Source: `"QuezX.com" <${SMTP_USER}>`,
                    Destination: {
                        ToAddresses: [user.emailId],
                        BccAddresses: BCC_EMAIL ? [BCC_EMAIL] : [],
                        CcAddresses: ccAddresses,
                    },
                    ReplyToAddresses: [REPLY_TO],
                    Template: 'trans-wide_c-verify-hourly-update',
                    TemplateData: JSON.stringify(templateData),
                },
            });

            return true;
        } catch(err) {
            logger.error('Hourly send mail failed: ', err);
            return user;
        }
    }
};
