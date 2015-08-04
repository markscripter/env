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

  return _.extend(data, tempData);
};
