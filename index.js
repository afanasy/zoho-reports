var
  _ = require('underscore'),
  path = require('path'),
  request = require('request'),
  stream = require('stream'),
  qs = require('qs'),
  db3Where = require('db3-where'),
  zohoAction = {
    insert: 'ADDROW',
    update: 'UPDATE',
    delete: 'DELETE',
    import: 'IMPORT'
  }

function ZohoReports (opts) {
  if (this.constructor !== ZohoReports)
    return new ZohoReports(opts)
  if (!opts.user || !opts.authtoken || !opts.db)
    throw (new Error('Please specify zoho username, authtoken and db'))
  _.defaults(this, opts, {
    url: 'https://reportsapi.zoho.com'
  })
}

ZohoReports.prototype.insert = function (table, data, done) {
  var
    self = this,
    url = self.buildUrl({
      table: table,
      action: 'insert'
    }),
    opts = {
      url: url,
      form: data,
      method: 'post'
    }
  request(opts, self.handleError(done))
}
ZohoReports.prototype.update = function (table, where, data, done) {
  if (arguments.length === 3) {
    done = data
    data = where
    where = {}
  }
  data = _.extend({
    ZOHO_CRITERIA: ZohoReports.buildCriteria(where)
  }, data)
  var
    self = this,
    url = self.buildUrl({
      table: table,
      action: 'update'
    }),
    opts = {
      url: url,
      form: data,
      method: 'post'
    }
  request(opts, self.handleError(done))
}
ZohoReports.prototype.delete = function (table, where, done) {
  if (typeof arguments[1] == 'function') {
    done = where
    where = {}
  }
  var
    self = this,
    url = self.buildUrl({
      table: table,
      action: 'delete'
    }),
    opts = {
      url: url,
      form: {ZOHO_CRITERIA: ZohoReports.buildCriteria(where)},
      method: 'post'
    }
  request(opts, self.handleError(done))
}
ZohoReports.prototype.import = function (table, data, done) {
    var
      self = this,
      url = self.buildUrl({
        table: table,
        action: 'import'
      }),
      opts = {
        url: url,
        formData: buildDataImport(data),
        method: 'post'
      }
      request(opts, self.handleError(done))
}
ZohoReports.prototype.buildUrl = function (opts) {
  // https://reportsapi.zoho.com/api/abc@zoho.com/EmployeeDB/EmployeeDetails?
  //  ZOHO_ACTION=ADDROW&
  //  ZOHO_OUTPUT_FORMAT=XML&
  //  ZOHO_ERROR_FORMAT=XML&
  //  authtoken=g38sl4j4856guvncrywox8251sssds&
  //  ZOHO_API_VERSION=1.0
  var
    self = this,
    action = zohoAction[opts.action],
    query = qs.stringify({
      ZOHO_ACTION: action,
      ZOHO_OUTPUT_FORMAT: 'JSON',
      ZOHO_ERROR_FORMAT: 'JSON',
      ZOHO_API_VERSION: '1.0',
      authtoken:self.authtoken
    })
  return self.url + '/api/' +
    [ self.user, self.db, opts.table].join('/') +
    '?' + query

}
ZohoReports.buildCriteria = function (where) {
  return db3Where.query(where)
}
ZohoReports.prototype.handleError = function (done) {
  done = _.isFunction(done) ? done : _.noop
  return function (err, res, body) {
    var output
    if (err) return done(err)
    try {
      output = JSON.parse(body)
    } catch (e) {
      ouput = body
    }
    if (res.statusCode !== 200) {
      var err = new Error('API error, ' + res.statusCode)
      err.code = res.statusCode
      err.response = output.response
      return done(err)
    }
    return done(null, output)
  }
}

module.exports = ZohoReports

function buildDataImport (data) {
  var type, filename, output, file
  if (data instanceof stream.Readable) {
    file = data
    type = path.extname(data.path) === '.csv' ? 'CSV' : 'JSON'
  } else {
    if (_.isArray(data)) {
      data = JSON.stringify(data)
      type = 'JSON'
      filename = 'data.json'
    } else if (_.isString(data)) {
      type = 'CSV'
      filename = 'data.csv'
    }
    file = {
      value: new Buffer(data),
      options: {
        filename: filename
      }
    }
  }
  output = {
    ZOHO_FILE: file,
    ZOHO_IMPORT_FILETYPE: type,
    ZOHO_IMPORT_TYPE: 'APPEND',
    ZOHO_AUTO_IDENTIFY: 'true',
    ZOHO_CREATE_TABLE: 'false',
    ZOHO_ON_IMPORT_ERROR: 'ABORT',
  }
  return output
}
