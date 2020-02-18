const rp = require('request-promise');
const bluebird = require('bluebird');
const moment = require('moment');
const db = require('../../conn/sqldb');
import {MONEYCONTROL_URL, NSE_ANNOUNCEMENT_URL} from '../../config/environment';

const logger = require('../../components/logger');

var exec = require('child_process').exec;

function execute(command, callback) {
    // eslint-disable-next-line max-statements-per-line
    exec(command, function(error, stdout, stderr) {
        callback(stdout);
    });
}


const { Stock } = db;

const getDataFromMoneyControl = async(symbol) => {
    //console.log(MONEYCONTROL_URL.replace('{{symbol}}', symbol));

    try {
        return rp({
            method: 'GET',
            uri: MONEYCONTROL_URL.replace('{{symbol}}', symbol),
            json: true,
            headers: {
                'content-type': 'application/json'
            },
        });
    } catch(err) {
        console.error('Error Fetching Moneycontrol data', err);
        return {};
    }
};

const getAnnouncementsFromNSE = async(symbol) =>
/*   console.log(NSE_ANNOUNCEMENT_URL.replace('{{symbol}}', symbol));
    try {
        const data = await rp({
            method: 'GET',
            uri: NSE_ANNOUNCEMENT_URL.replace('{{symbol}}', symbol),
           // json: true,
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*!/!*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36',
                'upgrade-insecure-requests': '1',
                'cache-control': 'no-cache',
                connection: 'keep-alive'
            },
        });


       // const data = await rp(NSE_ANNOUNCEMENT_URL.replace('{{symbol}}', symbol))
        console.log(data);
        return data;
    } catch(err) {
         console.error('Error Fetching NSE data', err);
         return {};
    }*/

    // eslint-disable-next-line no-unused-vars
    new Promise(function(resolve, reject) {
        execute(`curl '${NSE_ANNOUNCEMENT_URL.replace('{{symbol}}', symbol)}' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36'  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'  --compressed`, function(json) {
            // console.log(json,JSON.parse(json));
            return resolve(JSON.parse(json));
        });
    })
;

/*const getDataFromExternalSource = async(symbols) => symbols.map(
    async(sym) => {
        //  console.log(sym);
        const [{data}, {rows}] = await Promise.all([
            getDataFromMoneyControl(sym.moneycontrol_sym),
            getAnnouncementsFromNSE(sym.symbol)
        ]);
        console.log(data);
        console.log(rows);
        return Object.assign(data, {announcement: rows});
    }
);*/

const getDataFromExternalSource = async(symbols) => {
    const finalArr = [];
    for(let i = 0; i < symbols.length; i++) {
        const [data, {rows}] = await Promise.all([
            getDataFromMoneyControl(symbols[i].moneycontrol_sym),
            getAnnouncementsFromNSE(symbols[i].symbol)
        ]);
        finalArr.push(Object.assign(data, {announcement: rows}));
    }
    return finalArr;
};

exports.getDataForNSE500 = async() => {
    const where = { group: 'NSE500' };

    const stocks = await Stock.findAll({
        attributes: ['symbol', 'moneycontrol_sym'],
        where,
        raw: true,
    });

    return getDataFromExternalSource(stocks);
};
