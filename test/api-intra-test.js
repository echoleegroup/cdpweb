const express = require('express');
const fs = require('fs');
const multer  = require('multer');
const path = require('path');
const Q = require('q');
const winston = require('winston');
const factory = require("../middlewares/response-factory");
const auth = require('../middlewares/login-check');
const constants = require('../utils/constants');
const upload = multer({ storage: multer.memoryStorage() });

module.exports = (app) => {
  winston.info('[api-model] Creating api-test route.');
  const router = express.Router();

  router.get('/download/:queryId', factory.ajax_response_factory(), (req, res) => {
    winston.info(`===[TEST] /download/${req.params.queryId}`);
    fs.createReadStream('/Users/hd/Documents/project/cdp/Archive.zip').pipe(res);
  });

  router.post('/delete/:queryId', factory.ajax_response_factory(), (req, res) => {
    winston.info(`===[TEST] /delete/${req.params.queryId}`);
    res.json();
  });

  router.get('/unzipper/extract/:queryId', factory.ajax_response_factory(), (req, res) => {
    const shortid = require('shortid');
    const mkdirp = require('mkdirp');
    const yauzl = require('yauzl');
    const queryId = req.params.queryId;
    const sparkZipPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
    const tempFolderName = shortid.generate();
    const workingPath = path.resolve(constants.WORKING_DIRECTORY_PATH_ABSOLUTE, tempFolderName);
    mkdirp(workingPath);

    res.json();

    Q.nfcall(yauzl.open, sparkZipPath, {lazyEntries: true}).then(zipfile => {
      zipfile.readEntry();
      zipfile.on('entry', entry => {
        winston.info('on entry event: ', entry.fileName);
        if (/\/$/.test(entry.fileName)) {
          // Directory file names end with '/'.
          // Note that entires for directories themselves are optional.
          // An entry's fileName implicitly requires its parent directories to exist.
          zipfile.readEntry();
        } else {
          // file entry
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) throw err;

            readStream.on("end", () => {
              winston.info('entry end');
              zipfile.readEntry();
            });

            readStream.pipe(fs.createWriteStream(path.join(workingPath, entry.fileName)));
          });
        }
      }).on('close', () => {
        winston.info('entry closed');
      }).on('error', err => {
        winston.error('entry error: ', err);
      });
    }).fail(err => {
      winston.error('open zip error: ', err);
    });
    // fs.createReadStream(sparkZipPath)
    //   .pipe(unzipper.Extract({ path: workingPath }))
    //   .on('close', () => {
    //     winston.info('on close');
    //   })
    //   .on('error', (err) => {
    //     winston.error('on error', err);
    //     console.log(err);
    //   });
  });

  router.get('/unzipper/:queryId', factory.ajax_response_factory(), (req, res) => {
    const shortid = require('shortid');
    const mkdirp = require('mkdirp');
    const fileHelper = require('../helpers/file-helper');
    const integratedHelper = require('../helpers/integrated-analysis-helper');
    const integrationTaskService = require('../services/integration-analysis-task-service');
    const queryId = req.params.queryId;
    const sparkZipPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
    const tempFolderName = shortid.generate();
    const workingPath = path.resolve(constants.WORKING_DIRECTORY_PATH_ABSOLUTE, tempFolderName);
    const finalZipPath = path.join(constants.ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE, `${queryId}.zip`);
    mkdirp(workingPath);
    let records = 0;

    Q.nfcall(integratedHelper.extractAndParseQueryResultFile, sparkZipPath, workingPath, {
      master: [],
      relatives: []
    }).then(info => {
        records = info.records;
        winston.info(`parsing to csv: ${info.entries}`);
        return Q.nfcall(fileHelper.archiveFiles, info.entries, finalZipPath);
      }).then(destZipPath => {
      winston.info(`archive finished: ${destZipPath}`);
      return Q.nfcall(fileHelper.archiveStat, destZipPath);
    }).fail(err => {
      winston.error('parsing to csv and archive failed: ', err);
      // Q.nfcall(integrationTaskService.setQueryTaskStatusParsingFailed, queryId).fail(err => {
      //   throw new Error(`set query task status as parsing-failed failed: ${err}`);
      // });
      throw err;
    });
  });

  router.post('/htmlMail', factory.ajax_response_factory(), (req, res) => {
    const to = req.body.to;
    const subject = req.body.subject || '';
    const text = req.body.text;
    const mail = require('../utils/mail-util');

    Q.nfcall(mail.textMail, to, {
      subject: subject,
      content: text
    }).then(() => {
      res.json();
    }).fail(err => {
      res.json(null, 500, 'internal service error!');
    });
  });

  router.post('/objectMail', factory.ajax_response_factory(), upload.single('file'), (req, res) => {
    const to = req.body.to;
    const subject = req.body.subject || '';
    const text = req.body.text;
    const file = req.file;
    const mail = require('../utils/mail-util');
    const originalname = file.originalname;

    Q.nfcall(mail.textMail, to, {
      subject: subject,
      content: text,
      attachments: [
        {
          filename: originalname,
          content: file.buffer
        }
      ]
    }).then(() => {
      res.json();
    }).fail(err => {
      res.json(null, 500, 'internal service error!');
    });
  });

  return router;
};