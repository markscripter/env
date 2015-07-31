// required items
import express from 'express';
import morgan from 'morgan';
import FileStreamRotator from 'file-stream-rotator';
import fs from 'fs';
import path from 'path';

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
app.set('views', path.join(__dirname, 'pages/'));
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

// static content
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));
app.use(express.static('public'));

// logging
app.use(morgan('combined', {stream: expressLogStream}));

// Routes
require(path.join(__dirname, '_routes.js'))(app);

app.listen('3000');
