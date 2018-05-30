'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _express = require('express');var _express2 = _interopRequireDefault(_express);
var _cors = require('cors');var _cors2 = _interopRequireDefault(_cors);
var _compression = require('compression');var _compression2 = _interopRequireDefault(_compression);
var _cookieParser = require('cookie-parser');var _cookieParser2 = _interopRequireDefault(_cookieParser);
var _bodyParser = require('body-parser');var _bodyParser2 = _interopRequireDefault(_bodyParser);
var _prettyError = require('pretty-error');var _prettyError2 = _interopRequireDefault(_prettyError);
var _swaggerUiExpress = require('swagger-ui-express');var _swaggerUiExpress2 = _interopRequireDefault(_swaggerUiExpress);
var _yamljs = require('yamljs');var _yamljs2 = _interopRequireDefault(_yamljs);
var _morgan = require('morgan');var _morgan2 = _interopRequireDefault(_morgan);
var _router = require('./router');var _router2 = _interopRequireDefault(_router);
var _logger = require('./logger');var _logger2 = _interopRequireDefault(_logger);
var _postal = require('./lib/postal');var _postal2 = _interopRequireDefault(_postal);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // eslint-disable-line no-unused-vars

require('./db');

const app = (0, _express2.default)();

app.use((0, _morgan2.default)('combined', { stream: _logger2.default.stream }));

app.set('trust proxy', 'loopback');

app.use(
(0, _cors2.default)({
  origin(origin, next) {
    const whitelist = process.env.CORS_ORIGIN ?
    process.env.CORS_ORIGIN.split(',') :
    [];
    next(null, whitelist.includes(origin));
  },
  credentials: true }));



app.use((0, _compression2.default)());
app.use((0, _cookieParser2.default)());
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_bodyParser2.default.json());

const swaggerDocument = _yamljs2.default.load('swagger.yaml');
app.use('/explore', _swaggerUiExpress2.default.serve, _swaggerUiExpress2.default.setup(swaggerDocument));

app.use(_router2.default);

const pe = new _prettyError2.default();
pe.skipNodeFiles();
pe.skipPackage('express');
pe.withoutColors(); // So that logfile output is clean.
pe.start(); // Ensures that PrettyError is used app-wide.

app.use((err, req, res, next) => {
  process.stderr.write(pe.render(err));
  next();
});

// const postal = new Postal();
// postal.init();
// postal.listen();

// // *******remove these once Angular front end is written ********
app.use(_express2.default.static(`${__dirname}/../public`));
app.set('views', `${__dirname}/../public`); // __dirname is {workspace}/build
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

// // ****************************************
exports.default =
app;
//# sourceMappingURL=app.js.map
