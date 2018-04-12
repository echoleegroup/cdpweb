const nodemailer = require('nodemailer');
const winston = require('winston');
const mailInfo = require("../app-config").get("MAIL_INFO");

module.exports.mail = (to, options = {}, callback = () => { }) => {
  console.log(to) ;
  console.log(options) ;
  let transporter = nodemailer.createTransport({
    host: mailInfo.service,
    port:mailInfo.port,
    secure:true,
    auth: {
      user: mailInfo.user,
      pass: mailInfo.pass
    }
  });

  let mailOptions = {
    from:  mailInfo.from,
    to: to,
    subject: options.subject,
    html: options.content
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      winston.error("mail send error: ", error)
      callback(error,null);
    } else {
      winston.info("Email sent: " + info.response)
      callback(null,"Email sent: " + info.response);
    }
  });
};