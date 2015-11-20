var
  _ = require('underscore'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = module.exports = express()

app.zohoData = {
  raabbajam: {
    testdb: {
      testtable: [
        {fname: 'Raabb'}
      ]
    }
  }
}
app.use(bodyParser.urlencoded({extended: false}))
app.all('/api/:user/:db/:table', function (req, res) {
  var
    userData = app.zohoData[req.params.user] = app.zohoData[req.params.user] || {},
    dbData = userData[req.params.db] = userData[req.params.db] || {}
  if (req.query.ZOHO_ACTION == 'ADDROW') {
    dbData[req.params.table] = dbData[req.params.table] || []
    dbData[req.params.table].push(req.body)
  } else if (req.query.ZOHO_ACTION == 'UPDATE') {
    var
      tableData = dbData[req.params.table] || [],
      where = {}
    req.body.ZOHO_CRITERIA.split('and').forEach(function (data) {
      where[data.match(/\`.+\`/)[0].replace(/\`/g, '')] = data.match(/\'.+\'/)[0].replace(/\'/g, '')
    })
    tableData.forEach(function (row) {
      if (_.isMatch(row, where))
        row = _.extend(row, _.omit(req.body, 'ZOHO_CRITERIA'))
    })
  } else if (req.query.ZOHO_ACTION == 'DELETE') {
    var
      tableData = dbData[req.params.table] || [],
      where = {}
    req.body.ZOHO_CRITERIA.split('and').forEach(function (data) {
      where[data.match(/\`.+\`/)[0].replace(/\`/g, '')] = data.match(/\'.+\'/)[0].replace(/\'/g, '')
    })
    tableData.forEach(function (row, i) {
      if (_.isMatch(row, where)) {
        tableData.splice(i, 1)
      }
    })
  } else if (req.query.ZOHO_ACTION == 'IMPORT') {
    // @TODO test import function
  }
  return res.json(req.body)
})
