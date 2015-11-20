var
  _ = require('underscore'),
  path = require('path'),
  request = require('request'),
  stream = require('stream'),
  db3Where = require('db3-where')

var ZohoReports = module.exports = function (config) {
  _.defaults(this, config, {
    url: 'https://reportsapi.zoho.com/api',
    action: {
      insert: 'ADDROW',
      update: 'UPDATE',
      delete: 'DELETE',
      import: 'IMPORT'
    },
    ZOHO_OUTPUT_FORMAT: 'JSON',
    ZOHO_ERROR_FORMAT: 'JSON',
    ZOHO_API_VERSION: '1.0',
    ZOHO_IMPORT_FILETYPE: 'JSON',
    ZOHO_IMPORT_TYPE: 'APPEND',
    ZOHO_AUTO_IDENTIFY: true,
    ZOHO_CREATE_TABLE: false,
    ZOHO_ON_IMPORT_ERROR: 'ABORT',
    ZOHO_MATCHING_COLUMNS: 'id',
    ZOHO_AUTO_IDENTIFY: false,
    ZOHO_COMMENTCHAR: '#',
    ZOHO_DELIMITER: 0,
    ZOHO_QUOTED: 2,
    ZOHO_CREATE_TABLE: true,
    ZOHO_DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss'
  })
}

ZohoReports.prototype.request = function (d) {
  var request = {
    method: 'POST',
    url: this.url + [this.user, this.db, d.table].join('/')
  }
  request.qs = _.extend({ZOHO_ACTION: d.action}, _.pick(this, ['ZOHO_OUTPUT_FORMAT', 'ZOHO_ERROR_FORMAT', 'ZOHO_API_VERSION', 'authtoken']))
  d.data = d.data || {}
  if (!_.isUndefined(d.where))
    d.data.ZOHO_CRITERIA = db3Where.query(d.where)
  if (d.action == 'IMPORT') {
    config.formData = _.pick(this, [
      'ZOHO_IMPORT_FILETYPE',
      'ZOHO_IMPORT_TYPE',
      'ZOHO_AUTO_IDENTIFY',
      'ZOHO_CREATE_TABLE',
      'ZOHO_ON_IMPORT_ERROR',
      'ZOHO_MATCHING_COLUMNS',
      'ZOHO_AUTO_IDENTIFY',
      'ZOHO_COMMENTCHAR',
      'ZOHO_DELIMITER',
      'ZOHO_QUOTED',
      'ZOHO_CREATE_TABLE',
      'ZOHO_DATE_FORMAT'
    ])
    if (_.isString(d.data))
      d.data = fs.createReadStream(d.data)
    if (d.data instanceof stream.Readable)
      config.formData.ZOHO_FILE = d.data
  }
  else
    request.form = d.data
  return request
}

ZohoReports.prototype.insert = function (table, data, done) {
  request(this.request({table: table, action: 'ADDROW', data: data}), this.done(done))
}

ZohoReports.prototype.update = function (table, where, data, done) {
  if (arguments.length === 3) {
    done = data
    data = where
    where = undefined
  }
  request(this.request({table: table, action: 'UPDATE', where: where, data: data}), this.done(done))
}

ZohoReports.prototype.delete = function (table, where, done) {
  if (_.isFunction(where)) {
    done = where
    where = {}
  }
  request(this.request({table: table, action: 'DELETE', where: where}), this.done(done))
}

ZohoReports.prototype.import = function (table, data, done) {
  request(this.request({table: table, action: 'IMPORT', data: data}), this.done(done))
}

ZohoReports.prototype.done = function (done) {
  done = _.isFunction(done)? done: _.noop
  return function (err, res, body) {
    if (err)
      return done(err)
    try {body = JSON.parse(body)} catch (e) {return done(e)}
    done(null, body)
  }
}
