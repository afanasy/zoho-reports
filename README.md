Node client for [Zoho Reports](https://zohoreportsapi.wiki.zoho.com/).

## Init
```js
var ZohoReports = require('zoho-reports')
var zoho = new ZohoReports({
  user: 'username',
  authtoken: 'authtoken',
  db: 'db'
})
```

## .insert(String table, Object row, Function done)
Insert a row (click [here](https://zohoreportsapi.wiki.zoho.com/Adding-Single-Row.html) for more details).
```js
zoho.insert('fruit', {id: 1, name: 'Apple'}, function (err, data) {
  console.log('done')
})
```

## .update(String table, Object where, Function done)
Update rows (click [here](https://zohoreportsapi.wiki.zoho.com/Updating-Data.html) for more details).

## .delete(String table, Object where, Function done)
Delete rows (click [here](https://zohoreportsapi.wiki.zoho.com/Deleting-Data.html) for more details).

## .import
Import bulk data (click [here](https://zohoreportsapi.wiki.zoho.com/importing-bulk-data.html) for more details).

### .import(String table, String csv, Function done)
Imports data from csv string.

### .import(String table, ReadStream stream, Function done)
Imports data from stream.

### .import(String table, Array data, Function done)
Imports data from array of objects.

## .export(String table, Function done)
Export bulk data. Works for Tables and Reports.

```js
zoho.export('fruit', (err, data) => {
  if (err) {
    console.log('\nerror: ', err)
  } else {
    console.log('data output:', data)
  }
})
```
