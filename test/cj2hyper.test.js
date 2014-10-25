var should = require('should');
var cj2hyper = require('..');
var readdir = require('fs').readdirSync;

describe('cj2hyper', function() {
  var root = __dirname + '/cases';
  readdir(root).forEach(function(name) {
    var path = root + '/' + name + '/';
    var input = require(path + 'in.json');
    var output = require(path + 'out.json');

    it(name, function() {
      cj2hyper(input).should.eql(output);
    });
  });
});
