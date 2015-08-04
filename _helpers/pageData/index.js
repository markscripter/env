var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var appRoot = require('app-root-path');

var data = require('../../pages/pageData.json');
var compData = glob.sync(appRoot + '/components/**/**.json', {});
var tempData = {};

compData.forEach(function cb(page) {
  _.extend(tempData, require(page));
});

module.exports = function getPageData() {
  return _.extend(data, tempData);
};
