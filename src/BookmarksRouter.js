const express = require('express');
const logger = require('./logger');
const bodyParser = express.json();
const uuid = require('uuid/v4');
const xss = require('xss');

const BookmarksService = require('./BookmarksService')

const bookmarkRouter = express.Router();

let bookmarks = [];

bookmarkRouter.route('/')
.get((req, res, next) => {
  logger.info('returning bookmarks');
  BookmarksService.getBookmarks(req.app.get('db'))
    .then(bookmarkData => {
      if (bookmarkData.length) {
        res.json(bookmarkData)
        bookmarks=bookmarkData
      } else {
        res
          .status(200)
          .send('No bookmarks exist')
      }
    })
    .catch(next);
})
.post(bodyParser, (req, res, next) => {
  const { title, url, rating, description } = req.body

  if (!title || !url || !rating) {
    logger.error('url, title, or rating not provided')
    return res
      .status(400)
      .send('Must provide a title, url, and rating');
  }

  if (isNaN(rating) || rating > 5 || rating < 1) {
    console.log('failed')
    logger.error('rating must be a number netween 1 and 5')
    return res
      .status(400)
      .send('Rating must be a number between 1 and 5')
  }

  const newBook = {
    title: xss(title),
    url: xss(url),
    rating,
    description: description ? xss(description) : null
  }

  logger.info('made new book')

  BookmarksService.addBookmarks(req.app.get('db'), newBook)
    .then(response => {
      bookmarks.push(response[0])
      res.status(201).json(response)
    })
    .then(logger.info('made new book'))
    .then(bookmarks.push(newBook))
    .catch(next);

})

bookmarkRouter.route('/:id')
.get((req, res, next) => {
  logger.info('returning bookmark');
  id=req.params.id
  BookmarksService.getBookmark(req.app.get('db'), id)
    .then(bookmarkData => {
      if(bookmarkData.length) {
        res.json(bookmarkData[0])
      } else {
        res
          .status(400)
          .send('There is no bookmark with that id')
      }
    })
    .catch(next);
})
.delete((req, res, next) => {
  const id = req.params.id;

  let idValid = false;
  let i=0;

  while(!idValid && i<bookmarks.length) {
    if (bookmarks[i].id === Number(id)) {
      idValid = true;
    }
    i++
  }

  if (idValid) {
    bookmarks.splice(i-1, 1)
    logger.info('deleted item with id '+id)
    BookmarksService.deleteBookmark(req.app.get('db'), id)
          .then(response => res.json(response))
          .catch(next)
  } else {
  logger.error('no book with provided id')
  return res
    .status(400)
    .send('No book with that ID, cannnot delete it')
  }
})
.patch(bodyParser, (req, res, next) => {
  const id = req.params.id;
  newInfo = {
  }
  const reqKeys = Object.keys(req.body)
  reqKeys.forEach(key => newInfo[key] = req.body[key])

  BookmarksService.updateBookmark(req.app.get('db'), id, newInfo )
    .then(response => res.json(response))
    .catch(next)
})

module.exports = bookmarkRouter;