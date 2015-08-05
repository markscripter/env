var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var appRoot = require('app-root-path');

module.exports = function getPageData(root, comps) {

  var data = require(root);
  var compData = glob.sync(comps, {});
  var tempData = {};

  compData.forEach(function cb(page) {
    _.extend(tempData, require(page));
  });

  // since require will cache the origin items returned from the require(root) call,
  // we need to delete the cache so it fetches any updated data from the json file
  delete require.cache[require.resolve(root)];

  return _.extend(tempData, data);
};
