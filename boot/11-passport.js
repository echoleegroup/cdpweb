'use strict';

const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = () => {
  passport.serializeUser((user, done) => {
    // winston.info('serializeUser: %j', user);
    done(null, user);
  });

  passport.deserializeUser((session_user, done) => {
    // winston.info('serializeUser: %j', session_user);
    done(null, session_user);
  });

  passport.use('local', new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, username, password, done) => {
    const loginService = require('../services/login-service');

    Q.nfcall(loginService.loginPlatform, username, password).then((user) => {
      if (user) {
        Q.nfcall(loginService.updateLoginTime, user.userId).then((result) => {
          return done(null, _.pick(user, ['userId', 'userName', 'email']));
        });
      } else {
        winston.error('帳號或密碼不正確');
        return done(null, false, {
          message: '帳號或密碼不正確'
        });
      }
    }).fail(err => {
      winston.error('error: ', err);
      return done(null, false, {
        message: '系統錯誤，請洽管理員'
      });
    });
  }));

  //winston.info('=== [Auth] Current Auth Strategy:', appConfig.get('AUTH_STRATEGIES')['CURRENT']);
};
