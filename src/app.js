require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const authRouter = require('./API');
const logger = require('./logger');
const bookmarkRouter = require('./bookmarks');
const BookmarksService = require('./BookmarksService')

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(authRouter);

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// app.use('/bookmarks', bookmarkRouter);

app.get('/bookmarks', (req, res, next) => {
  BookmarksService.getBookmarks(req.app.get('db'))
    .then(bookmarks => res.json(bookmarks))
    .catch(next);
})


app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
    res.status(500).json(response);
  });

module.exports = app;