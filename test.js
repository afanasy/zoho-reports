require('dotenv').load()
var
  expect = require('expect.js'),
  fs = require('fs'),
  ZohoReports = require('./main'),
  ZOHO_OPTS = {
    user: process.env.ZOHO_USERNAME,
    authtoken: process.env.ZOHO_AUTH_TOKEN,
    db: process.env.ZOHO_DB
  }

describe('zoho-report module', function () {
  this.timeout(10 * 1000)
  describe('basic initialization', function () {
    it('always called using new', function () {
      var zoho = ZohoReports(ZOHO_OPTS)
      expect(zoho.constructor).to.be(ZohoReports)
    })
    it('throws error when required parameters are not provided', function () {
      expect(ZohoReports).withArgs().to.throwError()
    })
    it('sets opts property on construction', function () {
      var
        opts = ZOHO_OPTS,
        zoho = new ZohoReports(opts)
      expect(zoho.opts).to.eql(opts)
    })
  })
  describe('row insertion', function () {
    var zoho = new ZohoReports(ZOHO_OPTS)
    it('throws error when `table` parameter is not provided', function () {
      expect(zoho.insert).withArgs().to.throwError()
    })
    it('throws error when `data` parameter is not provided', function () {
      expect(zoho.insert).withArgs('testtable').to.throwError()
    })
    it('doesn\'t throw error when `done` parameter is not provided', function () {
      var data = {fname: 'tester', lname: 'tester'}
      function test() {
        zoho.insert('testtable', data)
      }
      expect(test).to.not.throwError()
      // expect(zoho.insert).withArgs('testtable', data).to.not.throwError()
    })
    it('insert row', function (done) {
      var data = {fname: 'tester', lname: 'tester'}
      zoho.insert(process.env.ZOHO_TABLE, data, done)
    })
  })
  describe('row modification', function () {
    var
      zoho = new ZohoReports(ZOHO_OPTS),
      where = {fname: 'raabb', lname: 'ajam'},
      data = {id: 4}
    it('throws error when `table` parameter is not provided', function () {
      expect(zoho.update).withArgs().to.throwError()
    })
    it('throws error when `data` parameter is not provided', function () {
      expect(zoho.update).withArgs('testtable').to.throwError()
    })
    it('doesn\'t throw error when `where` parameter is not provided', function (done) {
      var data = {id: 5}
      function test() {
        zoho.update('testtable', data, done)
      }
      expect(test).to.not.throwError()
    })
    it('update row', function (done) {
      zoho.update(process.env.ZOHO_TABLE, where, data, done)
    })
  })
  describe('row deletion', function () {
    var
      zoho = new ZohoReports(ZOHO_OPTS),
      where = {fname: 'tester', lname: 'tester'}
    it('throws error when `table` parameter is not provided', function () {
      expect(zoho.delete).withArgs().to.throwError()
    })
    it('doesn\'t throw error when `where` parameter is not provided', function (done) {
      function test() {
        zoho.delete('testtable', done)
      }
      expect(test).to.not.throwError()
    })
    it('delete row', function (done) {
      zoho.delete(process.env.ZOHO_TABLE, where, done)
    })
  })
  describe('importing bulk data', function () {
    var
      zoho = new ZohoReports(ZOHO_OPTS),
      json = [
        {fname: 'tester', lname: 'tester', id: 1},
        {fname: 'tester', lname: 'tester', id: 2},
        {fname: 'tester', lname: 'tester', id: 3},
      ],
      csv = 'fname,lname,id\ntester,tester,4\ntester,tester,5\ntester,tester,6',
      jsonStream = fs.createReadStream(__dirname + '/data.json'),
      csvStream = fs.createReadStream(__dirname + '/data.csv')
    it('throws error when `table` parameter is not provided', function () {
      expect(zoho.import).withArgs().to.throwError()
    })
    it('import bulk data using json', function (done) {
      zoho.import(process.env.ZOHO_TABLE, json, done)
    })
    it('import bulk data using csv', function (done) {
      zoho.import(process.env.ZOHO_TABLE, csv, done)
    })
    it('import bulk data using stream csv', function (done) {
      zoho.import(process.env.ZOHO_TABLE, csvStream, done)
    })
    it('import bulk data using stream json', function (done) {
      zoho.import(process.env.ZOHO_TABLE, jsonStream, done)
    })
  })
  describe('handle error', function () {
    var zoho = new ZohoReports(ZOHO_OPTS)
    describe('error handling from error status code', function () {
      it('handles error on not found table', function (done) {
        zoho.insert('not_found_table', {}, function (err, data) {
          expect(err).to.be.an(Error)
          expect(err.code).to.eql(404)
          expect(err.message).to.be.ok
          expect(err.response).to.eql({
            action: 'ADDROW',
            error: {
              code: 7138,
              message: 'Table not_found_table is not present in the database testdb'
            },
            "uri": "/api/raabbajam@airbinder.co.id/testdb/not_found_table"
          })
          done()
        })
      })
      it('handles error on empty data', function (done) {
        zoho.insert('testtable', {}, function (err, data) {
          expect(err).to.be.an(Error)
          expect(err.code).to.eql(400)
          expect(err.message).to.be.ok
          expect(err.response).to.eql({
            action: 'ADDROW',
            error: {
              code: 8016,
              message: "You need to have atleast one column for INSERT or UPDATE action"
            },
            uri: "/api/raabbajam@airbinder.co.id/testdb/testtable"
          })
          done()
        })
      })

    })
  })
  describe('url building', function () {
    // @TODO test url building for complex data
  })
  describe('criteria building', function () {
    // @TODO test criteria building for complex filter
  })
})
