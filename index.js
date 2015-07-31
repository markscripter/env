// required items
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _fileStreamRotator = require('file-stream-rotator');

var _fileStreamRotator2 = _interopRequireDefault(_fileStreamRotator);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

// instantiate express application

var _path2 = _interopRequireDefault(_path);

var app = (0, _express2['default'])();

// express log file
var logDirectory = _path2['default'].join(__dirname, '/logs');

// make sure our logs directory exits
if (!_fs2['default'].existsSync(logDirectory)) {
  // if not, create it
  _fs2['default'].mkdirSync(logDirectory);
}

// setup rotating log files
var expressLogStream = _fileStreamRotator2['default'].getStream({
  filename: _path2['default'].join(logDirectory, '/express-%DATE%.log'),
  frequency: 'daily',
  verbose: true
});

// Set views path and view engine
app.set('views', _path2['default'].join(__dirname, 'pages/'));
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

// static content
app.use('/css', _express2['default']['static']('public/css'));
app.use('/js', _express2['default']['static']('public/js'));
app.use(_express2['default']['static']('public'));

// logging
app.use((0, _morgan2['default'])('combined', { stream: expressLogStream }));

// Routes
require(_path2['default'].join(__dirname, '_routes.js'))(app);

app.listen('3000');