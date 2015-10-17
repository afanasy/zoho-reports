require('dotenv').load()
var
  expect = require('expect.js'),
  ZOHO_OPTS = {
    user: process.env.ZOHO_USERNAME,
    authtoken: process.env.ZOHO_AUTH_TOKEN,
    db: process.env.ZOHO_DB
  },
  ZohoReports = require('./main')

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
  describe('insert row', function () {
    var zoho = new ZohoReports(ZOHO_OPTS)
    it('throws error when `table` parameter is not provided', function () {
      expect(zoho.insert).withArgs().to.throwError()
    })
    it('throws error when `data` parameter is not provided', function () {
      expect(zoho.insert).withArgs('testtable').to.throwError()
    })
    it.skip('doesn\'t throw error when `done` parameter is not provided', function () {
      var data = {fname: 'tester', lname: 'tester'}
      function test() {
        zoho.insert('testtable', data)
      }
      expect(test).to.not.throwError()
      // expect(zoho.insert).withArgs('testtable', data).to.not.throwError()
    })
    it.skip('insert row', function (done) {
      var data = {fname: 'tester', lname: 'tester'}
      zoho.insert(process.env.ZOHO_TABLE, data, function (err, res) {
        if (err) return done(err)
        console.log(res);
        done()
      })
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
})
