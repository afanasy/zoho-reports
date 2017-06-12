var
  _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
  request = require('request'),
  isStream = require('is-stream'),
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
    url: this.url + '/' + [this.user, this.db, d.table].join('/')
  }
  request.qs = _.extend({ZOHO_ACTION: d.action}, _.pick(this, ['ZOHO_OUTPUT_FORMAT', 'ZOHO_ERROR_FORMAT', 'ZOHO_API_VERSION', 'authtoken']))
  d.data = d.data || {}
  if (!_.isUndefined(d.where))
    d.data.ZOHO_CRITERIA = db3Where.query(d.where)
  if (d.action == 'IMPORT') {
    request.formData = _.pick(this, [
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
    request.formData = _.mapObject(request.formData, function (d) {return String(d)})
    request.formData.ZOHO_FILE = {options: {filename: 'data.' + this.ZOHO_IMPORT_FILETYPE}}
    if (_.isString(d.data))
      request.formData.ZOHO_FILE.value = fs.createReadStream(d.data)
    if (isStream.readable(d.data))
      request.formData.ZOHO_FILE.value = d.data
    if (_.isArray(d.data))
      request.formData.ZOHO_FILE.value = JSON.stringify(d.data)
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
    where = undefined
  }
  request(this.request({table: table, action: 'DELETE', where: where}), this.done(done))
}

ZohoReports.prototype.import = function (table, data, done) {
  request(this.request({table: table, action: 'IMPORT', data: data}), this.done(done))
}

ZohoReports.prototype.export = function (table, done) {
  request(this.request({table: table, action: 'EXPORT'}), this.done(done))
}

ZohoReports.prototype.done = function (done) {
  done = _.isFunction(done)? done: _.noop
  return function (err, res, data) {
    data = data && data.replace(/\\'/g, "'")
    if (err)
      return done(err)
    try {data = JSON.parse(data)} catch (e) {return done(e)}
    done(data.response.error, data.response.result)
  }
}
