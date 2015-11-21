
var
  ZohoCloudSql = require('zoho-cloud-sql')
  expect = require('expect.js'),
  fs = require('fs'),
  _ = require('underscore'),
  ZohoReports = require('../'),
  zoho = new ZohoReports({url: 'http://localhost:3000/api',
    user: 'raabbajam',
    authtoken: 'testtoken',
    db: 'testdb',
  }),
  server = require('./server'),
  app = server.listen(3000)

describe('zoho-report with mock server', function () {
  after(function (done) {
    app.close(done)
  })
  it('inserts', function (done) {
    var data = {fname: 'Raabb'}
    zoho.insert('testtable', data, function (err, result) {
      if (err) return done(err)
      var serverData = server.zohoData.raabbajam.testdb.testtable
      expect(_.last(serverData)).to.eql(data)
      done()
    })
  })
  it('updates', function (done) {
    zoho.update('testtable', {fname: 'Raabb'}, {modified: true}, function (err, result) {
      if (err) return done(err)
      var serverData = server.zohoData.raabbajam.testdb.testtable
      expect(_.last(serverData).modified).to.eql('true')
      done()
    })
  })
  it('deletes', function (done) {
    var table = server.zohoData.raabbajam.testdb.testtable
    var length = table.length
    zoho.delete('testtable', {fname: 'Raabb'}, function (err, result) {
      if (err) return done(err)
      expect(table.length).to.eql(length - 1)
      done()
    })
  })
})
