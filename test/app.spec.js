const app = require('../src/app')
const BookmarksService = require('../src/BookmarksService')
const knex = require('knex')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe('BookmarksService', () => {
  let db

  before('connect to the db', () => {
    db = knex({
      client: 'pg',
      connection: process.env.DB_TEST_URL
    })
    app.set('db', db) // sets test knex link
  })

  const cleanBmTable = () => db('bookmarks').truncate()
  before('clean Bm table', cleanBmTable)
  afterEach('clean Bm table', cleanBmTable)
  after('disconnect from db', () => db.destroy()) // disconnect from db after all tests run

  describe('Unauthorized requests', () => {
    it('responds with 401 unauthorized got GET /bookmarks', () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(401, { error: 'Unauthorized request' })
    })
    it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
      return supertest(app)
        .post('/bookmarks')
        .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
      const secondBookmark = makeBookmarksArray()[1]
      return supertest(app)
        .get(`/bookmarks/${secondBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
      const aBookmark = makeBookmarksArray()[1]
      return supertest(app)
        .delete(`/bookmarks/${aBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })
  })

  describe('GET /bookmarks', () => {
    context('given no bookmarks in db', () => {
      it('responds 200, with "no bookmarks exist response"', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200)
      })
    })
    context('given bookmarks in db', () => {
      const testBms = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db.insert(testBms).into('bookmarks')
      })

      it('responds 200 with matching test data', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBms)
      })
    })
  })

  describe('GET /bookmarks/:id', () => {
    context('given no bookmarks in db', () => {
      it('responds 404', () => {
        return supertest(app)
          .get('/bookmarks/9000')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404)
      })
    })
    context('given bookmark with id 2 in db', () => {
      const testBms = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db.insert(testBms).into('bookmarks')
      })
      it('responds 200 with matching test data', () => {
        return supertest(app)
          .get('/bookmarks/2')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBms[1])
      })
    })
  })

  describe('POST /bookmarks', () => {
    it('responds 400 with malformed data', () => {
      return supertest(app)
        .post('/bookmarks')
        .send({})
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400)
    })
    it('responds with 400 when rating is wrong format', () => {
      return supertest(app)
        .post('/bookmarks')
        .send({
          title: 'a',
          url: 'b',
          description: 'c',
          rating: 6
        })
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400)
    })
    it('responds with 201 and posted item', () => {
      const postedBookmark = {
        title: 'a',
        url: 'b',
        description: 'c',
        rating: 5
      }
      return supertest(app)
        .post('/bookmarks')
        .send(postedBookmark)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .then(response => {
          expect(201)
          expect(response.title === postedBookmark.title)
          expect(response.url === postedBookmark.url)
          expect(response.description === postedBookmark.description)
          expect(response.rating == postedBookmark.rating)
        })
    })
  })

  describe('DELETE /bookmarks/:id', () => {
    context('db has data', () => {
      beforeEach('insert bookmarks', () => {
        return db.insert(makeBookmarksArray()).into('bookmarks')
      })
      it('returns a 204', () => {
        return supertest(app)
          .delete('/bookmarks/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
      })
      it('returns 400 when id does not exist', () => {
        return supertest(app)
          .delete('/bookmarks/9000')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400)
      })
    })
  })
  describe('PATCH /bookmarks/:id', () => {
    context('db has data', () => {
      beforeEach('insert bookmarks', () => {
        return db.insert(makeBookmarksArray()).into('bookmarks')
      })
      it('returns a 204', () => {
        return supertest(app)
          .patch('/bookmarks/1')
          .send({title: 'x'})
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
      })
      it('returns a 404 when item to update does not exist', () => {
        return supertest(app)
          .patch('/bookmarks/9000')
          .send({title: 'x'})
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404)
      })
      it('responds with 400 when no data is supplied', () => {
        return supertest(app)
          .patch('/bookmarks/1')
          .send({})
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400)
      })

    })
  })
})
