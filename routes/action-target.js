"use strict";
const express = require('express');
const Q = require('q');
const winston = require('winston');
const mssql = require('mssql');
const _connector  = require('../utils/sql-query-util');
const middleware = require('../middlewares/login-check');

module.exports = (app) => {
    console.log('[TargetRoute::create] Creating target route.');
    const router = express.Router();

    router.get('/custom/search', middleware.check(), function (req, res) {
        let modelList = req.session.modelList ;
        let navMenuList = req.session.navMenuList ;
        let mgrMenuList = req.session.mgrMenuList ;

        let modelSql = 
        'SELECT mm.* ' + 
        'FROM md_Model mm, md_Batch mb ' + 
        'WHERE mm.mdID = mb.mdID and mm.batID = mb.batID and mm.mdID = @mdID and mm.batID = @batID';

        //preparedStatement
        /*
        let prepared = _connector.preparedStatement()
        .setType('mdID', mssql.NVarChar)
        .setType('batID', mssql.NVarChar);

        Q.nfcall(prepared.execute, modelSql, {
            mdID: req.query.mdID,
            batID: req.query.batID
        }).then((resultSet) => {
            winston.info('===resultSet: %j', resultSet);
            res.render('custom-search', {
                'id': req.session.userid, 
                'modelInfo': resultSet[0],
                'modelList': modelList, 
                'navMenuList': navMenuList,
                'mgrMenuList': mgrMenuList
            });
        }).fail((err) => {
            winston.error('===query model failed:', err);
        });
        */
        winston.info('===_connector.execSqlByParams');
        Q.nfcall(_connector.execSqlByParams, modelSql, {
            mdID: {
                type: mssql.NVarChar,
                value: req.query.mdID
            },
            batID: {
                type: mssql.NVarChar,
                value: req.query.batID
            }
        }).then((resultSet) => {
            winston.info('===resultSet: %j', resultSet);
            res.render('custom-search', {
                'id': req.session.userid, 
                'modelInfo': resultSet[0],
                'modelList': modelList, 
                'navMenuList': navMenuList,
                'mgrMenuList': mgrMenuList
            });
        }).fail((err) => {
            winston.error('===query model failed:', err);
        });
    });

    return router;
};