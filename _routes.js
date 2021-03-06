const path = require('path');

module.exports = (app) => {
  app.route('/').get((req, res) => {
    res.render(path.join(__dirname, 'pages/index.jade'));
  });

  app.route('/styleguide').get((req, res) => {
    res.render(path.join(__dirname, 'pages/_styleguide/_styleguide.jade'));
  });
};
