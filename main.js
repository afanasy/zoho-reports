var
  ROOT_URL = 'https://reportsapi.zoho.com',
  request = require('request')

function ZohoReports(opts) {
  if (this.constructor !== ZohoReports)
    return new ZohoReports(opts)
  if (!opts.user || !opts.authtoken || !opts.db)
    throw (new Error('Please specify zoho username, authtoken and db'))
  this.opts = opts
}

ZohoReports.prototype.insert = insert
ZohoReports.prototype.buildUrl = buildUrl
ZohoReports.prototype.handleError = handleError

function insert(table, data, done) {
  if (!table)
    return done(new Error('You need to pass `table` name parameter.'))
  if (!data)
    return done(new Error('You need to have atleast one column for INSERT or UPDATE action'))
  if (!done)
    done = function(){}
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

function buildUrl(opts) {
  // https://reportsapi.zoho.com/api/abc@zoho.com/EmployeeDB/EmployeeDetails?
  //  ZOHO_ACTION=ADDROW&
  //  ZOHO_OUTPUT_FORMAT=XML&
  //  ZOHO_ERROR_FORMAT=XML&
  //  authtoken=g38sl4j4856guvncrywox8251sssds&
  //  ZOHO_API_VERSION=1.0
  var
    self = this,
    action = getZohoAction(opts.action)
  return ROOT_URL + '/api/' +
    [ self.opts.user, self.opts.db, opts.table].join('/') +
    '?' +
    'ZOHO_ACTION=' + action +
    '&ZOHO_OUTPUT_FORMAT=JSON&ZOHO_ERROR_FORMAT=JSON&ZOHO_API_VERSION=1.0&' +
    'authtoken=' + self.opts.authtoken
}

function handleError(done) {
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

function getZohoAction(action) {
  var actions = {
    insert: 'ADDROW'
  }
  return actions[action]
}
