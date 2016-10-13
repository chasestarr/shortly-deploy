var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/dev');

var urlSchema = new Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
});

urlSchema.statics.setCode = function(link, cb) {
  var shasum = crypto.createHash('sha1');
  // shasum.update(model.get('url'));
  shasum.update(link.url);
  // TODO
  // This does not update the document. Fix me.
  this.findOneAndUpdate({url: link.url}, {'code': shasum.digest('hex').slice(0, 5)}, function (err, raw) {
    console.log('raw', raw);
    if (err) {
      console.error(err, raw);
    }
    cb();
  });
};



var userSchema = new Schema({
  username: String,
  password: String
});

userSchema.statics.comparePassword = function(attemptedPassword, password, callback) {
  bcrypt.compare(attemptedPassword, password, function(err, isMatch) {
    callback(isMatch);
  });
};

userSchema.statics.hashPassword = function() {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.get('password'), null, null).bind(this)
    .then(function(hash) {
      this.set('password', hash);
    });
};

module.exports = {
  urlSchema: urlSchema,
  userSchema: userSchema
};



// var knex = require('knex')({
//   client: 'sqlite3',
//   connection: {
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   },
//   useNullAsDefault: true
// });
// var db = require('bookshelf')(knex);
//
// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('baseUrl', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });
//
// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });
//
// module.exports = db;
