const path = require('path');
const fs = require('fs');
const ftpd = require('ftpd');
const ip = require('ip');
const winston = require('winston');
const constants = require('../utils/constants');
const options = {
  host: process.env.IP || ip.address(),
  port: process.env.FTP_PORT || 2121,
  tls: null,
};
const AUTH = {
  username: process.env.FTP_AUTH_USERNAME,
  pass: process.env.FTP_AUTH_PASS
};

winston.info('my ip address: ', ip.address());

module.exports = () => {

  if ('enable' === process.env.FTP_ENABLE) {
    const server = new ftpd.FtpServer(options.host, {
      getInitialCwd: function() {
        return '/';
      },
      getRoot: function(connection, callback) {
        const root = path.join(process.cwd(), constants.FTP_FOLDER_PATH);

        fs.stat(root, function(err, stats) {
          if (!stats) {
            fs.mkdir(root, function(err) {
              if (err) callback(err, root);
            });
          }
          callback(null, root);
        });
      },
      pasvPortRangeStart: 1025,
      pasvPortRangeEnd: 1050,
      tlsOptions: options.tls,
      allowUnauthorizedTls: true,
      useWriteFile: false,
      useReadFile: false
      // noWildcards: true
      // uploadMaxSlurpSize: 7000, // N/A unless 'useWriteFile' is true.
    });

    server.on("client:connected", function(socket) {
      let username = null;
      winston.info("client connected: " + socket.remoteAddress);
      socket.on("command:user", function(user, success, failure) {
        winston.info('command:user: user=%s, success=%s', user);
        if (user === AUTH.username) {
          username = user;
          success();
        } else failure('invalid username');
      });
      socket.on("command:pass", function(pass, success, failure) {
        winston.info('command:pass: pass=%s, success=%s', pass);
        if (pass === AUTH.pass) {
          success(username);
        }
        else failure('authentication failed!');
      });
    });

    server.debugging = 4;
    server.listen(options.port);
    console.log('Listening on port ' + options.port);
  }

};