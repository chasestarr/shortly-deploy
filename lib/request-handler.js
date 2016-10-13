var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var Promise = require('bluebird');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}).then(function(links) {
    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }
  Link.findOne({url: uri}).then(function(found) {
    if (found) {
      res.status(200).send(found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
          visits: 0
        });
        newLink.save().then(function(newLink) {
          // Links.add(newLink);
          Link.setCode(newLink, (err, data) => {
            if (err) {
              console.error(err);
              res.end(err);
            } else {
              res.status(200).send(data);
            }
          })
        });
      });
    }
  }).catch(err => { throw err; });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  // console.log('username:', username, 'password:', password);
  User.findOne({username: username})
    .then(function(user) {
      if (!user) {
        console.log('user not found!');
        res.redirect('/login');
      } else {
        console.log(user);
        console.log('user found');
        User.comparePassword(password, user.password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .then(function(user) {
      if (!user) {
        var newUser = new User({
          username: username,
          password: User.hashPassword(password)
        });
        newUser.save().then(function(newUser) {
            console.log('newUser: ', newUser);
            util.createSession(req, res, newUser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params.shortcode }).then(function(link) {
    console.log('req params: ', req.params.shortcode);
    if (!link) {
      res.redirect('/');
    } else {
      Link.findOneAndUpdate({code: req.params.shortcode}, { visits: link.visits + 1 })
        .then(function() {
          return res.redirect(link.url);
        });
    }
  });
};
