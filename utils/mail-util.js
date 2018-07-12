const Q = require('q');
const nodemailer = require('nodemailer');
const winston = require('winston');
const handlebars = require('handlebars');

const send = (to, options = {}, callback = () => { }) => {
  // winston.info(to) ;
  // winston.info(options) ;
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  let mailOptions = {
    from:  process.env.SMTP_USER,
    to: to,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      winston.error("htmlMail send error: ", error)
      callback(error,null);
    } else {
      winston.info("Email sent: " + info.response);
      callback(null,"Email sent: " + info.response);
    }
  });
};

module.exports.htmlMail = (to, options = {}, callback = () => { }) => {
  let wrappedOption = {
    subject: options.subject,
    html: options.content,
    text: undefined
  };
  send(to, wrappedOption, callback);
};

module.exports.textMail = (to, options = {}, callback = () => { }) => {
  let wrappedOption = {
    subject: options.subject,
    html: undefined,
    text: options.content
  };
  send(to, wrappedOption, callback);
};

module.exports.sendByTemplate = (code, to, subject, data, callback = () => {}) => {
  const fs = require('fs');
  const path = require('path');
  const templatePath = path.resolve(__dirname, `../templates/${code}.hbs`);
  Q.nfcall(fs.readFile, templatePath, 'utf-8').then(template => {
    let html = handlebars.compile(template)(data);
    return Q.nfcall(this.htmlMail, to, {
      subject: subject,
      content: html
    }).then(() => {
      callback(null, html);
    });
  }).fail(err => {
    winston.error('send htmlMail by template failed: ', err);
    callback(err);
  });
};