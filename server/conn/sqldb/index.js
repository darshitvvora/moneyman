/**
 * Sequelize initialization module
 */

import Sequelize from 'sequelize';
const _ = require('lodash');

import config from '../../config/environment';
const logger = require('../../components/logger');

const Op = Sequelize.Op;
const operatorsAliases = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col,
};

const sqlDefaults = {
    dialect: 'mysql',
    timezone: '+05:30',
    logging: config.NODE_ENV === 'development' && ((str) => {
        logger.debug(str);
    }),
    define: {
        charset: 'utf8',
        dialectOptions: {
            collate: 'utf8mb4_general_ci',
        },
    },
    operatorsAliases,
};

const db = {
    Sequelize,
    sequelizeMoneyman: new Sequelize(config.MYSQL_EXTENSION, sqlDefaults),
};

[
    'Client', 'User', 'Stock', 'Watchlist', 'DailyData'
].forEach((model) => {
    db[model] = db.sequelizeMoneyman
        .import(`../../api/${_.camelCase(model)}/${_.camelCase(model)}.model.js`);
});

Object.keys(db).forEach((modelName) => {
    if('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

module.exports = db;
