// required items
const express = require('express');
const morgan = require('morgan');
const FileStreamRotator = require('file-stream-rotator');
const fs = require('fs');
const path = require('path');

// instantiate express application
const app = express();

// express log file
const logDirectory = path.join(__dirname, '/logs');

// make sure our logs directory exits
if (!fs.existsSync(logDirectory)) {
  // if not, create it
  fs.mkdirSync(logDirectory);
}

// setup rotating log files
const expressLogStream = FileStreamRotator.getStream({
  filename: path.join(logDirectory, '/express-%DATE%.log'),
  frequency: 'daily',
  verbose: true,
});

// Set views path and view engine
app.set('views', './server/views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

// static content
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));

// logging
app.use(morgan('combined', {stream: expressLogStream}));
