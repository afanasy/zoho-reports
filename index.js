var _ = require('underscore')
var fs = require('fs')
var superagent = require('superagent')
var db3Where = require('db3-where')

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

ZohoReports.prototype.agent = function (d) {
  var agent = superagent.
    post(this.url + '/' + [this.user, this.db, d.table].join('/')).
    query(_.extend({ZOHO_ACTION: d.action}, _.pick(this, ['ZOHO_OUTPUT_FORMAT', 'ZOHO_ERROR_FORMAT', 'ZOHO_API_VERSION', 'authtoken']))).
    buffer()

  d.data = d.data || {}
  if (!_.isUndefined(d.where))
    d.data.ZOHO_CRITERIA = db3Where.query(d.where)
  if (d.action != 'IMPORT')
    return agent.type('form').send(form)
  var form = _.pick(this, [
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
  agent.field(_.mapObject(form, function (d) {return String(d)}))
  var filename = 'data.' + this.ZOHO_IMPORT_FILETYPE
  var file = d.data
  if (_.isString(file))
    file = fs.createReadStream(file)
  if (_.isArray(file))
    file = Buffer.from(JSON.stringify(file))
  return agent.attach('ZOHO_FILE', file, filename)
}

ZohoReports.prototype.insert = function (table, data, done) {
  this.agent({table: table, action: 'ADDROW', data: data}).end(this.done(done))
}

ZohoReports.prototype.update = function (table, where, data, done) {
  if (arguments.length === 3) {
    done = data
    data = where
    where = undefined
  }
  this.agent({table: table, action: 'UPDATE', where: where, data: data}).end(this.done(done))
}

ZohoReports.prototype.delete = function (table, where, done) {
  if (_.isFunction(where)) {
    done = where
    where = undefined
  }
  this.agent({table: table, action: 'DELETE', where: where}).end(this.done(done))
}

ZohoReports.prototype.import = function (table, data, done) {
  this.agent({table: table, action: 'IMPORT', data: data}).end(this.done(done))
}

ZohoReports.prototype.export = function (table, done) {
  this.agent({table: table, action: 'EXPORT'}).end(this.done(done))
}

ZohoReports.prototype.done = function (done) {
  done = _.isFunction(done)? done: _.noop
  return function (err, res) {
    if (err)
      return done(err)
    var data = res.text && res.text.replace(/\\'/g, "'")
    try {data = JSON.parse(data)} catch (e) {return done(e)}
    done(data.response.error, data.response.result)
  }
}
