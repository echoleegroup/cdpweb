const nodemailer = require('nodemailer');
const winston = require('winston');
const mailInfo = require("../app-config").get("MAIL_INFO");

module.exports.mail = (infoArray, req, res, callback = () => { }) => {
  console.log(infoArray) ;
  console.log(infoArray.to) ;
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
    to: infoArray["to"],
    subject: infoArray["subject"],
    text: infoArray["text"]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      winston.error("mail send error: "+error)
      callback(error);
    } else {
      winston.info("Email sent: " + info.response)
      callback("Email sent: " + info.response);
    }
  });
};