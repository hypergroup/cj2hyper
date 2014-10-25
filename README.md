cj2hyper
========

Collection+JSON to hyper+json transform.

Installation
------------

```sh
$ npm install cj2hyper
```

Usage
-----

```js
var cj2hyper = require('cj2hyper');

var document = {
  "collection": {
    "version": "1.0",
    "href" : "http://example.org/friends/"
  }
};

cj2hyper(document) // {"href": "http://example.org/friends/"}
```

See [test cases](https://github.com/hypergroup/cj2hyper/tree/master/test/cases) for example output.

Testing
-------

```sh
$ npm test
```
