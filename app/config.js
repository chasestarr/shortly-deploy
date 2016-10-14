var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

mongoose.connect(process.env.MONGODB_URI);

var urlSchema = new Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
});

urlSchema.statics.setCode = function(link, cb) {
  var shasum = crypto.createHash('sha1');
  shasum.update(link.url);
  this.findOneAndUpdate({url: link.url}, {code: shasum.digest('hex').slice(0, 5)}, {new: true}, function (err, raw) {
    if (err) {
      console.error(err, raw);
    }
    cb(err, raw);
  });
};



var userSchema = new Schema({
  username: String,
  password: String
});

userSchema.statics.comparePassword = function(attemptedPassword, password, callback) {
  // console.log('attempted password: ', attemptedPassword, '\npassword: ', password);
  bcrypt.compare(attemptedPassword, password, function(err, isMatch) {
    callback(isMatch);
  });
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hashSync(password);

  // var cipher = Promise.promisify(bcrypt.hash);
  // return cipher(this.get('password'), null, null).bind(this)
  //   .then(function(hash) {
  //     this.set('password', hash);
  //   });
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
