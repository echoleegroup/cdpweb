const nodemailer = require('nodemailer');
const winston = require('winston');

module.exports.mail = (to, options = {}, callback = () => { }) => {
  console.log(to) ;
  console.log(options) ;
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.PORT,
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