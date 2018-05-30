/* @flow */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import PrettyError from 'pretty-error';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import morgan from 'morgan';
import router from './router';
import logger from './logger';
import postal from './lib/postal'; // eslint-disable-line no-unused-vars

require('./db');

const app = express();

app.use(morgan('combined', { stream: logger.stream }));

app.set('trust proxy', 'loopback');

app.use(
  cors({
    origin(origin, next) {
      const whitelist = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : [];
      next(null, whitelist.includes(origin));
    },
    credentials: true,
  }),
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const swaggerDocument = YAML.load('swagger.yaml');
app.use('/explore', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(router);

const pe = new PrettyError();
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
app.use(express.static(`${__dirname}/../public`));
app.set('views', `${__dirname}/../public`); // __dirname is {workspace}/build
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

// // ****************************************

export default app;
