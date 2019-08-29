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

  const cleanBmTable = () => db('bookmarks_table').truncate()
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
      it('responds 200, with "no bookmarks exists response"', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200)
      })
    })
  })
})
